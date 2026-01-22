# 数据库迁移文件

## 第一步

在文件夹 `apps/api/typeorm/migration` 中创建，可以使用命令 `bun db:add {name}` 来创建文件

例如创建一个文章分类模块：

```bash
bun db:add article-category
```

## 第二步

创建文件完成后需要编写迁移文件的内容，文件的内容为Typeorm的迁移文件，可参考以往写好的迁移文件的写法
路径为 `apps/api/typeorm/migration`，需要注意的是要使用已经预设好的通用字段，定义在 `apps/api/typeorm/migration-common-column.ts`
