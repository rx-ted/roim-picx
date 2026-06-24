import { Hono } from 'hono';
import { verify } from 'hono/jwt';
import { Ok, Fail, type ImgItem, type ImgList, type ImgReq } from '../type';
import type { User, DbImage } from '../type';
import { parseRange, hashPassword } from '../utils';
import { auth, type AppEnv, getOrCreateSystemUser, loadUserPermissions } from '../middleware/auth';
import { listRateLimit } from '../middleware/rateLimit';
import { getProviderByType } from '../storage';

const imageRoutes = new Hono<AppEnv>();

/**
 * 检查用户是否可以查看所有图片
 * - 使用管理员 Token 登录
 * - 用户角色是 admin
 * - 用户被授权 canViewAll
 */
function canViewAllImages(user: User | undefined, isAdminToken: boolean): boolean {
  if (isAdminToken) return true;
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.canViewAll) return true;
  return false;
}

// list image (with rate limiting) - 从 D1 数据库查询
imageRoutes.post('/list', listRateLimit, async (c) => {
  // 手动解析用户认证（不阻断匿名访问）
  let user: User | undefined;
  let isAdminToken = false;
  let token = c.req.header('Authorization');
  if (token) {
    if (token.startsWith('Bearer ')) token = token.substring(7);
    try {
      if (token === c.env.PICX_AUTH_TOKEN) {
        isAdminToken = true;
        const systemUser = await getOrCreateSystemUser(c.env.DB);
        c.set('user', systemUser);
        user = systemUser;
      } else {
        const payload = await verify(token, c.env.PICX_AUTH_TOKEN, 'HS256');
        const jwtUser = payload as unknown as User;
        const permissions = await loadUserPermissions(c.env.DB, jwtUser.login, c.env.ADMIN_USERS);
        user = { ...jwtUser, ...permissions };
        c.set('user', user);
      }
    } catch (e) {
      // Token 无效，按匿名用户处理
      console.error('List auth parse failed:', e);
    }
  }
  const viewAll = canViewAllImages(user, isAdminToken);

  const data = await c.req.json<ImgReq>();
  if (!data.limit) {
    data.limit = 10;
  }
  if (data.limit > 100) {
    data.limit = 100;
  }

  // 处理文件夹路径
  let folder = '';
  if (data.delimiter && data.delimiter !== '/') {
    folder = data.delimiter;
    // 确保文件夹路径以 / 结尾
    if (!folder.endsWith('/')) {
      folder += '/';
    }
  }

  const keyword = data.keyword?.trim().toLowerCase();
  const offset = data.cursor ? parseInt(data.cursor, 10) : 0;

  try {
    // 构建 SQL 查询
    let query = 'SELECT * FROM images WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as total FROM images WHERE 1=1';
    const params: any[] = [];
    const countParams: any[] = [];

    // 权限过滤：未登录只能看公开图片
    if (!user) {
      query += ' AND is_private != 1';
      countQuery += ' AND is_private != 1';
    } else if (!viewAll) {
      // 非管理员只能看自己的图片 + 其他人的公开图片
      query += ' AND (user_login = ? OR is_private != 1)';
      countQuery += ' AND (user_login = ? OR is_private != 1)';
      params.push(user.login);
      countParams.push(user.login);
    }

    // 文件夹过滤
    if (folder) {
      query += ' AND folder = ?';
      countQuery += ' AND folder = ?';
      params.push(folder);
      countParams.push(folder);
    } else {
      // 根目录：只显示 folder 为空的图片
      query += " AND (folder = '' OR folder IS NULL)";
      countQuery += " AND (folder = '' OR folder IS NULL)";
    }

    // 关键词搜索
    if (keyword) {
      query += ' AND (LOWER(key) LIKE ? OR LOWER(original_name) LIKE ?)';
      countQuery += ' AND (LOWER(key) LIKE ? OR LOWER(original_name) LIKE ?)';
      const likePattern = `%${keyword}%`;
      params.push(likePattern, likePattern);
      countParams.push(likePattern, likePattern);
    }

    // 排序和分页
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(data.limit + 1, offset); // 多查一条用于判断是否还有更多

    // 执行查询
    const [result, countResult] = await Promise.all([
      c.env.DB.prepare(query)
        .bind(...params)
        .all(),
      c.env.DB.prepare(countQuery)
        .bind(...countParams)
        .first<{ total: number }>(),
    ]);

    const images = (result.results || []) as unknown as DbImage[];
    const hasMore = images.length > data.limit;
    const limitedImages = images.slice(0, data.limit);

    // 转换为 ImgItem 格式
    const urls: ImgItem[] = limitedImages.map((img: DbImage) => {
      const provider = getProviderByType(c, img.storage_type || 'R2');
      // 解析标签 JSON
      let tags: string[] | undefined;
      if (img.tags) {
        try {
          tags = JSON.parse(img.tags);
        } catch {
          tags = undefined;
        }
      }
      return {
        url: provider.getPublicUrl(img.key),
        key: img.key,
        size: img.size,
        originalName: img.original_name || undefined,
        uploadedBy: img.user_login,
        uploadedAt: img.created_at ? new Date(img.created_at).getTime() : undefined,
        storageType: img.storage_type,
        isPrivate: img.is_private === 1,
        nsfw: img.nsfw === 1,
        nsfwScore: img.nsfw_score,
        tags: tags,
      };
    });

    // 获取子文件夹列表（如果不是搜索模式）
    let prefixes: string[] = [];
    if (!keyword) {
      let folderQuery: string;
      let folderParams: any[];
      if (viewAll) {
        folderQuery = `SELECT DISTINCT folder FROM images 
                               WHERE folder LIKE ? AND folder != ? AND folder IS NOT NULL`;
        folderParams = [`${folder}%`, folder];
      } else if (!user) {
        folderQuery = `SELECT DISTINCT folder FROM images 
                               WHERE is_private != 1 AND folder LIKE ? AND folder != ? AND folder IS NOT NULL`;
        folderParams = [`${folder}%`, folder];
      } else {
        folderQuery = `SELECT DISTINCT folder FROM images 
                               WHERE (user_login = ? OR is_private != 1) AND folder LIKE ? AND folder != ? AND folder IS NOT NULL`;
        folderParams = [user.login, `${folder}%`, folder];
      }

      const folderResult = await c.env.DB.prepare(folderQuery)
        .bind(...folderParams)
        .all();

      // 提取直接子文件夹
      const subFolders = new Set<string>();
      const currentDepth = folder ? folder.split('/').filter(Boolean).length : 0;

      for (const row of (folderResult.results || []) as { folder: string }[]) {
        const parts = row.folder.split('/').filter(Boolean);
        if (parts.length > currentDepth) {
          // 获取下一级文件夹
          const nextFolder = `${parts.slice(0, currentDepth + 1).join('/')}/`;
          subFolders.add(nextFolder);
        }
      }
      prefixes = Array.from(subFolders).sort();
    }

    // 计算下一页的 cursor
    const nextCursor = hasMore ? String(offset + data.limit) : undefined;

    return c.json(
      Ok(<ImgList>{
        list: urls,
        next: hasMore,
        cursor: nextCursor,
        prefixes: prefixes,
        canViewAll: viewAll,
        total: countResult?.total || 0,
      }),
    );
  } catch (e) {
    console.error('Failed to list images from DB:', e);
    return c.json(Fail(`查询失败: ${(e as Error).message}`));
  }
});

// 更新图片标签
imageRoutes.post('/updateTags', auth, async (c) => {
  const user = c.get('user') as User | undefined;
  const isAdminToken = c.get('isAdminToken') || false;

  if (!user && !isAdminToken) {
    return c.json(Fail('未授权'));
  }

  try {
    const data = await c.req.json<{ key: string; tags: string[] }>();
    if (!data.key) {
      return c.json(Fail('缺少图片 key'));
    }

    // 验证标签格式
    const tags = Array.isArray(data.tags)
      ? data.tags.filter((t) => typeof t === 'string' && t.trim().length > 0)
      : [];

    // 检查图片是否存在，以及用户是否有权限修改
    const image = await c.env.DB.prepare('SELECT user_login FROM images WHERE key = ?')
      .bind(data.key)
      .first<{ user_login: string }>();

    if (!image) {
      return c.json(Fail('图片不存在'));
    }

    // 检查权限：只有图片所有者或管理员可以修改标签
    const canModify =
      isAdminToken || (user && (user.role === 'admin' || user.login === image.user_login));
    if (!canModify) {
      return c.json(Fail('无权限修改此图片'));
    }

    // 更新标签
    const tagsJson = tags.length > 0 ? JSON.stringify(tags) : null;
    await c.env.DB.prepare('UPDATE images SET tags = ? WHERE key = ?')
      .bind(tagsJson, data.key)
      .run();

    return c.json(Ok({ key: data.key, tags: tags }));
  } catch (e) {
    console.error('Failed to update image tags:', e);
    return c.json(Fail(`更新标签失败: ${(e as Error).message}`));
  }
});

// 重命名文件
imageRoutes.post('/rename', auth, async (c) => {
  try {
    const data = await c.req.json<{ oldKey: string; newKey: string }>();
    if (!data.oldKey || !data.newKey) {
      return c.json(Fail('Missing oldKey or newKey'));
    }

    // 获取图片详情以确定存储方式
    const img = await c.env.DB.prepare('SELECT * FROM images WHERE key = ?')
      .bind(data.oldKey)
      .first<DbImage>();

    if (!img) {
      return c.json(Fail('Image not found in DB'));
    }

    const provider = getProviderByType(c, img.storage_type || 'R2');
    const oldObject = await provider.get(data.oldKey);
    if (!oldObject) {
      return c.json(Fail('File not found in storage'));
    }

    // Copy file to new key
    await provider.put(data.newKey, oldObject.body!, {
      contentType: oldObject.contentType!,
      metadata: oldObject.metadata,
    });

    // Delete old file
    await provider.delete(data.oldKey);

    // 同步更新 D1 数据库
    c.executionCtx.waitUntil(
      c.env.DB.prepare('UPDATE images SET key = ? WHERE key = ?')
        .bind(data.newKey, data.oldKey)
        .run()
        .catch((e) => console.error('Failed to update image key in DB:', e)),
    );

    // 记录审计日志
    const user = c.get('user') as User | undefined;
    if (user) {
      c.executionCtx.waitUntil(
        c.env.DB.prepare(
          `INSERT INTO audit_logs (user_id, user_login, action, target_key, details) 
                     VALUES (?, ?, 'rename', ?, ?)`,
        )
          .bind(
            user.id,
            user.login,
            data.newKey,
            JSON.stringify({
              oldKey: data.oldKey,
              newKey: data.newKey,
              storageType: img.storage_type,
            }),
          )
          .run()
          .catch((e) => console.error('Failed to log rename:', e)),
      );
    }

    return c.json(Ok({ oldKey: data.oldKey, newKey: data.newKey }));
  } catch (e) {
    return c.json(Fail(`Rename failed: ${(e as Error).message}`));
  }
});

/**
 * 从 D1 删除图片记录并更新用户统计
 */
async function deleteImageFromDb(c: any, key: string): Promise<void> {
  try {
    const db = c.env.DB;
    // 获取图片信息用于更新用户统计
    const image = await db
      .prepare('SELECT user_login, size, storage_type FROM images WHERE key = ?')
      .bind(key)
      .first<{ user_login: string; size: number; storage_type: string }>();

    if (image) {
      // 从物理存储删除
      const provider = getProviderByType(c, (image.storage_type as any) || 'R2');
      await provider.delete(key);

      // 删除图片记录
      await db.prepare('DELETE FROM images WHERE key = ?').bind(key).run();

      // 更新用户存储统计
      await db
        .prepare('UPDATE users SET storage_used = MAX(0, storage_used - ?) WHERE login = ?')
        .bind(image.size, image.user_login)
        .run();
    }
  } catch (e) {
    console.error('Failed to delete image from DB/Storage:', e);
  }
}

// 删除key (GET方式，保持兼容)
imageRoutes.get('/del/:id{.+}', async (c) => {
  const key = c.req.param('id');
  if (!key) {
    return c.json(Fail('not delete key'));
  }
  // 同步删除 D1 记录和物理文件
  c.executionCtx.waitUntil(deleteImageFromDb(c, key));
  return c.json(Ok(key));
});

// delete image (DELETE方式)
imageRoutes.delete('/', auth, async (c) => {
  const params = await c.req.json<{ keys: string }>();
  const keys = params.keys;
  if (!keys || keys.length < 1) {
    return c.json(Fail('not delete keys'));
  }
  const arr = keys.split(',');
  const user = c.get('user') as User | undefined;

  try {
    for (const it of arr) {
      if (it?.length) {
        // 同步删除 D1 记录和物理文件
        c.executionCtx.waitUntil(deleteImageFromDb(c, it));

        // 记录审计日志
        if (user) {
          c.executionCtx.waitUntil(
            c.env.DB.prepare(
              `INSERT INTO audit_logs (user_id, user_login, action, target_key) 
                             VALUES (?, ?, 'delete', ?)`,
            )
              .bind(user.id, user.login, it)
              .run()
              .catch((e) => console.error('Failed to log delete:', e)),
          );
        }
      }
    }
  } catch (e) {
    console.log(`img delete error:${(e as Error).message}`);
  }
  return c.json(Ok(keys));
});

// 获取删除链接信息 (公开)
imageRoutes.get('/delInfo/:token', async (c) => {
  const token = c.req.param('token');
  if (!token) {
    return c.json(Fail('token is required'));
  }
  const key = await c.env.XK.get(`del:${token}`);
  if (!key) {
    return c.json(Fail('Invalid or expired deletion link'));
  }

  // 获取图片详情
  const img = await c.env.DB.prepare('SELECT * FROM images WHERE key = ?')
    .bind(key)
    .first<DbImage>();
  if (!img) {
    return c.json(Fail('Image metadata not found'));
  }

  const provider = getProviderByType(c, img.storage_type || 'R2');
  const object = await provider.head(key);
  if (!object) {
    return c.json(Fail('Image not found in storage'));
  }

  return c.json(
    Ok({
      key: key,
      url: provider.getPublicUrl(key),
      size: object.size,
      originalName: img.original_name,
    }),
  );
});

// 确认删除图片 (公开)
imageRoutes.post('/delImage/:token', async (c) => {
  const token = c.req.param('token');
  if (!token) {
    return c.json(Fail('token is required'));
  }
  const key = await c.env.XK.get(`del:${token}`);
  if (!key) {
    return c.json(Fail('Invalid or expired deletion link'));
  }

  try {
    await deleteImageFromDb(c, key);
    await c.env.XK.delete(`del:${token}`);
    return c.json(Ok('Delete success'));
  } catch (e) {
    return c.json(Fail(`Delete failed: ${(e as Error).message}`));
  }
});

// 4a: Set image as private with password
imageRoutes.post('/image/set-private', auth, async (c) => {
  const user = c.get('user') as User | undefined;
  if (!user) return c.json(Fail('Not authenticated'), 401);

  const { key, password } = await c.req.json<{ key: string; password: string }>();
  if (!key || !password) return c.json(Fail('Missing key or password'));

  // Verify ownership
  const img = await c.env.DB.prepare('SELECT user_login FROM images WHERE key = ?')
    .bind(key)
    .first<{ user_login: string }>();

  if (!img) return c.json(Fail('Image not found'));
  if (img.user_login !== user.login && user.role !== 'admin') {
    return c.json(Fail('Permission denied'), 403);
  }

  const hashHex = await hashPassword(password);

  await c.env.DB.prepare(
    'UPDATE images SET is_private = 1, private_password_hash = ? WHERE key = ?',
  )
    .bind(hashHex, key)
    .run();

  return c.json(Ok({ key, isPrivate: true }));
});

// 4b: Remove private status
imageRoutes.post('/image/remove-private', auth, async (c) => {
  const user = c.get('user') as User | undefined;
  if (!user) return c.json(Fail('Not authenticated'), 401);

  const { key } = await c.req.json<{ key: string }>();
  if (!key) return c.json(Fail('Missing key'));

  // Verify ownership
  const img = await c.env.DB.prepare('SELECT user_login FROM images WHERE key = ?')
    .bind(key)
    .first<{ user_login: string }>();

  if (!img) return c.json(Fail('Image not found'));
  if (img.user_login !== user.login && user.role !== 'admin') {
    return c.json(Fail('Permission denied'), 403);
  }

  await c.env.DB.prepare(
    'UPDATE images SET is_private = 0, private_password_hash = NULL WHERE key = ?',
  )
    .bind(key)
    .run();

  return c.json(Ok({ key, isPrivate: false }));
});

// 4c: Unlock private image with password
imageRoutes.post('/image/unlock', async (c) => {
  const { key, password } = await c.req.json<{ key: string; password: string }>();
  if (!key || !password) return c.json(Fail('Missing key or password'));

  const img = await c.env.DB.prepare(
    'SELECT private_password_hash FROM images WHERE key = ? AND is_private = 1',
  )
    .bind(key)
    .first<{ private_password_hash: string }>();

  if (!img?.private_password_hash) {
    return c.json(Fail('Image not found or not private'), 404);
  }

  const inputHash = await hashPassword(password);

  if (inputHash !== img.private_password_hash) {
    return c.json(Fail('Incorrect password'), 403);
  }

  const unlockToken = crypto.randomUUID();
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
  await c.env.XK.put(`unlock:${unlockToken}`, JSON.stringify({ key, expires_at: expiresAt }), {
    expirationTtl: 7 * 24 * 60 * 60,
  });

  return c.json(
    Ok({
      token: unlockToken,
      expiresAt,
    }),
  );
});

// image detail - catch-all for image keys
const RESERVED_PREFIXES = [
  'user',
  'admin',
  'github',
  'share',
  'folder',
  'list',
  'upload',
  'rename',
  'del',
  'delInfo',
  'delImage',
  'checkToken',
  'image',
];

function isReservedPath(id: string): boolean {
  const firstSegment = id.split('/')[0];
  return RESERVED_PREFIXES.includes(firstSegment);
}

imageRoutes.get('/:id{.+}', async (c) => {
  const id = c.req.param('id');

  // 跳过系统保留路径，让其他路由处理
  if (isReservedPath(id)) {
    return c.text('Not Found', 404);
  }

  // 获取图片信息以确定存储
  const img = await c.env.DB.prepare('SELECT * FROM images WHERE key = ?')
    .bind(id)
    .first<DbImage>();
  if (!img) {
    return c.json(Fail('Image not found in DB'), 404);
  }

  // Check if image is private
  if (img.is_private === 1) {
    let isOwner = false;
    const authHeader = c.req.header('Authorization');
    if (authHeader) {
      try {
        const authKey = c.env.PICX_AUTH_TOKEN;
        let token = authHeader;
        if (token.startsWith('Bearer ')) token = token.substring(7);
        if (token === authKey) {
          isOwner = true;
        } else {
          const payload = (await verify(token, authKey, 'HS256')) as any;
          if (payload.login === img.user_login) {
            isOwner = true;
          }
        }
      } catch {
        /* not owner */
      }
    }

    const unlockToken = c.req.query('unlock');
    let isValidUnlock = false;
    if (unlockToken) {
      const stored = await c.env.XK.get(`unlock:${unlockToken}`);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          if (data.key === id && data.expires_at > Date.now()) {
            isValidUnlock = true;
          }
        } catch {
          /* invalid */
        }
      }
    }

    if (!isOwner && !isValidUnlock) {
      return c.json(Fail('Image is private'), 403);
    }
  }

  const provider = getProviderByType(c, img.storage_type || 'R2');
  const range = parseRange(c.req.header('range') || null);

  const object = await provider.get(id, { range });
  if (object == null) {
    return c.json(Fail('object not found in storage'), 404);
  }

  // Check for expiration
  if (img.expires_at) {
    const expiresAt = new Date(img.expires_at).getTime();
    if (!Number.isNaN(expiresAt) && Date.now() > expiresAt) {
      c.executionCtx.waitUntil(deleteImageFromDb(c, id));
      return c.json(Fail('Image expired'), 404);
    }
  }

  // 记录访问统计
  c.executionCtx.waitUntil(
    (async () => {
      try {
        const referer = c.req.header('referer') || null;
        const userAgent = c.req.header('user-agent') || null;
        const cf = (c.req.raw as any).cf;
        const country = cf?.country || null;
        const city = cf?.city || null;

        await c.env.DB.prepare(
          `INSERT INTO image_stats (image_key, referer, user_agent, country, city) 
                 VALUES (?, ?, ?, ?, ?)`,
        )
          .bind(id, referer, userAgent, country, city)
          .run();

        await c.env.DB.prepare('UPDATE images SET view_count = view_count + 1 WHERE key = ?')
          .bind(id)
          .run();
      } catch (e) {
        console.error('Failed to record image stats:', e);
      }
    })(),
  );

  const headers = new Headers();
  if (object.contentType) headers.set('content-type', object.contentType);
  headers.set('content-length', object.size.toString());
  // Add Cache-Control for long-term caching of images
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');

  if (range) {
    headers.set(
      'content-range',
      `bytes ${range.offset}-${range.offset + object.size - 1}/${object.size}`,
    );
  }
  const status = object.body ? (range ? 206 : 200) : 304;
  return new Response(object.body, {
    headers,
    status,
  });
});

export default imageRoutes;
