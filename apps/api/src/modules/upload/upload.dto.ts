import z from "zod";
export const UploadFileDto = z.object({
  uid: z.string(),
  name: z.string(),
  uploadType: z.string(),
  size: z.string().or(z.number()),
  url: z.string().or(z.number()),
});

export const BaseUploadSettingDto = z.object({
  allowExts: z.string(),
  fileMaxSize: z.number(),
  test: UploadFileDto.nullish(),
  tests: z.array(UploadFileDto).nullish(),
});

export const LocalUploadSettingDto = z.object({
  ...BaseUploadSettingDto.shape,
  type: z.literal("local"),
  local: z.object({
    domain: z.string(),
    prefix: z.string().nullish(),
  }),
});

export const QiniuUploadSettingDto = z.object({
  ...BaseUploadSettingDto.shape,
  type: z.literal("qiniu"),
  qiniu: z.object({
    ak: z.string(),
    sk: z.string(),
    bucket: z.string(),
    zone: z.string(),
    domain: z.string(),
    prefix: z.string().nullish(),
  }),
});

export const OssUploadSettingDto = z.object({
  ...BaseUploadSettingDto.shape,
  type: z.literal("oss"),
  oss: z.object({
    accessKeyId: z.string(),
    accessKeySecret: z.string(),
    bucket: z.string(),
    region: z.string(),
    domain: z.string(),
    prefix: z.string().nullish(),
  }),
});

export const CosUploadSettingDto = z.object({
  ...BaseUploadSettingDto.shape,
  type: z.literal("cos"),
  cos: z.object({
    secretId: z.string(),
    secretKey: z.string(),
    region: z.string(),
    bucket: z.string(),
    domain: z.string(),
    prefix: z.string().nullish(),
  }),
});

export const UploadSettingDto = z.union([
  LocalUploadSettingDto,
  QiniuUploadSettingDto,
  OssUploadSettingDto,
  CosUploadSettingDto,
]);

export const UploadDto = z.object({
  filename: z.string(),
  filesize: z.number(),
});
