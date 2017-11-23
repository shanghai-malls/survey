#!/bin/sh
# -----------------------------------------------------
BIN_HOME=$(dirname $0)
BIN_HOME=`cd ${BIN_HOME} && pwd`
APP_HOME=`cd ${BIN_HOME}/../ && pwd`
DIST_HOME=/opt/survey

buildUI(){
    if [ ! -d ${APP_HOME}/survey/survey-ui/node_modules ]; then
      npm --prefix ${APP_HOME}/survey-ui install
    fi
    #构建survey-ui
    npm --prefix ${APP_HOME}/survey-ui run build
    rm -rf ${APP_HOME}/gateway/src/main/resources/static
    mkdir ${APP_HOME}/gateway/src/main/resources/static
    cp -rf ${APP_HOME}/survey-ui/build/* ${APP_HOME}/gateway/src/main/resources/static
}

APP_NAME=all
if [ $# -eq 1 ] ;then
    APP_NAME=$1
fi



if [ ${APP_NAME} == 'all' ] ;then
    buildUI
    mvn clean package -Ptest -f ${APP_HOME}
    cp -f ${APP_HOME}/survey/target/survey.war ${DIST_HOME}
    cp -f ${APP_HOME}/gateway/target/gateway.war ${DIST_HOME}

    nohup java -jar ${DIST_HOME}/gateway.war >${DIST_HOME}/gateway.log 2>&1 &

    nohup java -jar ${DIST_HOME}/survey.war >${DIST_HOME}/survey.log 2>&1 & tail -f ${DIST_HOME}/survey.log
elif [ $1 == 'survey' ];then
    mvn clean package -Ptest -f ${APP_HOME}/${APP_NAME}
    cp -f ${APP_HOME}/${APP_NAME}/target/${APP_NAME}.war ${DIST_HOME}

    nohup java -jar ${DIST_HOME}/${APP_NAME}.war >${DIST_HOME}/${APP_NAME}.log 2>&1 & tail -f ${DIST_HOME}/${APP_NAME}.log
elif [ $1 == 'gateway' ];then
    buildUI
    mvn clean package -Ptest -f ${APP_HOME}/${APP_NAME}
    cp -f ${APP_HOME}/${APP_NAME}/target/${APP_NAME}.war ${DIST_HOME}

    nohup java -jar ${DIST_HOME}/${APP_NAME}.war >${DIST_HOME}/${APP_NAME}.log 2>&1 & tail -f ${DIST_HOME}/${APP_NAME}.log
elif [ $1 == 'buildUI' ];then
    buildUI
elif [ $1 == 'install' ];then
    npm --prefix ${APP_HOME}/survey-ui install
fi
