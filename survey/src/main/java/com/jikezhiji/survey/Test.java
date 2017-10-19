package com.jikezhiji.survey;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Created by liusizuo on 2017/10/16 .
 */
public class Test {
	public static void main(String[] args) {
		String sql = "ALTER   TABLE `RESPONSE_ITEM` ADD COLUMN IF NOT EXISTS `CODE` VARCHAR(32) CHARSET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL;";
		List<String> tokens = Arrays.asList(sql.split(" ")).stream().filter(token->!token.equals("")).collect(Collectors.toList());
		for (final String s : tokens) {
			System.out.println(s);
		}
	}
}
