#!/bin/sh
# -----------------------------------------------------
BIN_HOME=$(dirname $0)
BIN_HOME=`cd ${BIN_HOME} && pwd`
APP_HOME=`cd ${BIN_HOME}/../ && pwd`

buildUI(){
    if [ ! -d ${APP_HOME}/survey/survey-ui/node_modules ]; then
      npm --prefix ${APP_HOME}/survey/survey-ui install
    fi
    #构建survey-ui
    npm --prefix ${APP_HOME}/survey/survey-ui run build
}

APP_NAME=all
if [ $# -eq 1 ] ;then
    APP_NAME=$1
fi

if [ ${APP_NAME} == 'all' ] ;then
    buildUI

    mvn clean package -Ptest -f ${APP_HOME}
    cp -f ${APP_HOME}/infrastructure/config-server/target/config-server.jar ${BIN_HOME}
    cp -f ${APP_HOME}/infrastructure/eureka-server/target/eureka-server.jar ${BIN_HOME}
    cp -f ${APP_HOME}/infrastructure/tenant-server/target/tenant-server.jar ${BIN_HOME}
    cp -f ${APP_HOME}/survey/survey/target/survey.jar ${BIN_HOME}
    cp -f ${APP_HOME}/survey/gateway/target/gateway.jar ${BIN_HOME}

else
    PARENT=infrastructure
    if [ ${APP_NAME} == 'survey' ] ||  [ ${APP_NAME} == 'gateway' ];then
        PARENT=survey
        if [ ${APP_NAME} == 'gateway' ] ;then
            buildUI
        fi
    fi
    mvn clean package -Ptest -f ${APP_HOME}/${PARENT}/${APP_NAME}
    cp -f ${APP_HOME}/${PARENT}/${APP_NAME}/target/${APP_NAME}.jar ${BIN_HOME}
fi

cd ${BIN_HOME} && ./start.sh ${APP_NAME} test