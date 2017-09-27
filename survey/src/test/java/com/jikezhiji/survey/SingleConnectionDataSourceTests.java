package com.jikezhiji.survey;

import org.junit.Test;
import org.springframework.jdbc.datasource.SingleConnectionDataSource;
import org.springframework.jdbc.support.SQLErrorCodeSQLExceptionTranslator;

import java.sql.SQLException;

/**
 * Created by liusizuo on 2017/7/12.
 */
public class SingleConnectionDataSourceTests {
    @Test
    public void testNotExistDatabase() throws SQLException {
        SingleConnectionDataSource dataSource = new SingleConnectionDataSource("jdbc:mysql://localhost:3306/mysql1","root","1qaz!QAZ",false);
        try{
            dataSource.getConnection();

        } catch (SQLException e) {
            System.out.println(e.getErrorCode());
//            SQLErrorCodeSQLExceptionTranslator sqlExceptionTranslator = new SQLErrorCodeSQLExceptionTranslator(dataSource);
//            throw sqlExceptionTranslator.translate("getConnection","",e);
        }
    }
}
