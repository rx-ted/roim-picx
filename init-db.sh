for file in migrations/*.sql; do
  echo "执行 $file ..."
  npx wrangler d1 execute picx-db --remote --file="$file"
done
