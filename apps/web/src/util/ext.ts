export const getFileExt = (file: File | string) =>
  (typeof file === "string" ? file : file.name)?.slice(
    (typeof file === "string" ? file : file.name)?.lastIndexOf(".") + 1
  );
