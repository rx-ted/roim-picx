const k = 1024;
// biome-ignore lint/correctness/noConstantCondition: <What is here?>
const dm = 2 < 0 ? 0 : 2;
const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
};

export default formatBytes;
