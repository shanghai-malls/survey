# 数据初始化规则
要保证运维、交付的简便性，就要尽可能的避免人力介入，从数据初始化的角度来看，我们需要满足一个原则——尽量保证脚本的幂等性，脚本具有幂等性那么我们便可以无数次的重复部署它而没有副作用。



## 创建表
```sql
CREATE TABLE IF NOT EXISTS `QUOTA` (...)
```

以下`if not exists`仅支持mariadb，不支持官方的mysql

## 更新表结构
- 增加字段
```sql
ALTER TABLE `QUOTA` ADD COLUMN IF NOT EXISTS `MESSAGE1` TEXT CHARSET utf8mb4 COLLATE utf8mb4_general_ci NULL;
```
- 删除字段
```sql
ALTER TABLE `QUOTA` DROP COLUMN IF EXISTS `MESSAGE1`
```
- 修改字段
```sql
ALTER TABLE `QUOTA` CHANGE COLUMN IF EXISTS `MESSAGE1` `MESSAGE` TEXT CHARSET utf8mb4 COLLATE utf8mb4_general_ci NULL;
```

## 插入数据
如果数据库存在某条记录则不插入，不存在则插入记录
- 数据库内置支持的写法
```sql
INSERT INTO TAB1 (ID) SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM TAB1 WHERE id = 1);
```
- 程序支持的写法，目前仅在mysql数据库中做过测试
```sql
INSERT INTO TAB1 (ID) VALUES (1); 
```

