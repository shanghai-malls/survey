package com.jikezhiji.survey.util;

import com.alibaba.druid.sql.SQLUtils;
import com.alibaba.druid.sql.ast.SQLStatement;
import com.alibaba.druid.sql.ast.statement.SQLCreateTableStatement;
import com.alibaba.druid.sql.dialect.mysql.visitor.MySqlSchemaStatVisitor;
import com.alibaba.druid.util.JdbcConstants;
import org.junit.Test;

import java.util.List;

/**
 * Created by liusizuo on 2017/11/22 .
 */
public class SQLParserTest {
	@Test
	public void testParse(){
//		String sql = "CREATE INDEX INT_MESSAGE_IX1 ON INT_MESSAGE (CREATED_DATE);alter table INVESTMENT_COMMENT_CONCLUSION add constraint FK_LEAD_ID_FOR_INVESTMENT_COMMENT_CONCLUSION foreign key (LEAD_ID) references LEAD_CONCLUSION (LEAD_ID);";
		String sql = "create table if not exists WEBSITE_STATE_EVENT (WEBSITE_ID VARCHAR(20) not null, VERSION bigint not null, STATE_EVENT_TYPE varchar(255) not null, WEBSITE_URL VARCHAR(255), DESCRIPTION VARCHAR(255), ACTIVE bit, CREATED_BY_USER_LOGIN varchar(255), CREATED_DATE datetime(6), COMMAND_ID varchar(255), IS_PROPERTY_WEBSITE_URL_REMOVED bit, IS_PROPERTY_DESCRIPTION_REMOVED bit, IS_PROPERTY_ACTIVE_REMOVED bit, primary key (WEBSITE_ID, VERSION)) ENGINE=InnoDB;";
		String dbType = JdbcConstants.MYSQL;

		//格式化输出
		String result = SQLUtils.format(sql, dbType);
		System.out.println(result); // 缺省大写格式
		List<SQLStatement> stmtList = SQLUtils.parseStatements(sql, dbType);

		//解析出的独立语句的个数
		System.out.println("size is:" + stmtList.size());
		for (int i = 0; i < stmtList.size(); i++) {

			SQLStatement stmt = stmtList.get(i);
			if(stmt instanceof SQLCreateTableStatement) {

			}
			MySqlSchemaStatVisitor visitor = new MySqlSchemaStatVisitor();
			stmt.accept(visitor);

			//获取表名称
			System.out.println("Tables : " + visitor.getCurrentTable());
			//获取操作方法名称,依赖于表名称
			System.out.println("Manipulation : " + visitor.getTables());
			//获取字段名称
			System.out.println("fields : " + visitor.getColumns());
		}
	}
}
