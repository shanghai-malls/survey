#!/bin/sh
BIN_HOME=$(dirname $0)
BIN_HOME=`cd ${BIN_HOME} && pwd`
APP_HOME=`cd ${BIN_HOME}/../ && pwd`
PASSWORD=UZ12qnF75F2TMV
REMOTE_HOST=admin@139.196.196.25
REMOTE_PATH=/data/web/saas
APPS=(survey,gateway,tenant-server,eureka-server,config-server);
for APP_NAME in ${APPS}
do
    if [ ${APP_NAME} == 'survey' ] || [ ${APP_NAME} == 'gateway' ];then
        SOURCE_CODE_HOME=${APP_HOME}/survey/${APP_NAME}
    else
        SOURCE_CODE_HOME=${APP_HOME}/infrastructure/${APP_NAME}
    fi
    sshpass -p ${PASSWORD} scp -P 58888 ${SOURCE_CODE_HOME}/target/${APP_NAME}.jar ${REMOTE_HOST}:${REMOTE_PATH}
    echo "$APP_NAME Uploaded success!"
done

