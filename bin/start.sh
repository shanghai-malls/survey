#!/bin/sh
# -----------------------------------------------------
JAVA_BIN=/usr/lib/jvm/java-1.8.0-openjdk-1.8.0.141-3.b16.el6_9.x86_64/jre/bin/java
APP_HOME=$(dirname $0)
APP_HOME=`cd ${APP_HOME} && pwd`
PROFILE=prod
APP_NAME=all


start_service(){
    cd ${APP_HOME}
    if [ ! -d logs ]; then
      mkdir logs  # 如果logs目录不存在，创建它
    fi

    if [ $1 == 'infrastructure' ];then
        start_service config-server 0
        sleep 1s;
        start_service eureka-server 0
        sleep 30s;
        start_service tenant-server 0
        sleep 30s;
    elif [ $1 == 'all' ];then
        start_service infrastructure;
        start_service gateway 0
        start_service survey
    elif [ $1 == 'survey' ];then
        echo "Trying start $1"
        nohup ${JAVA_BIN} -jar ${APP_HOME}/$1.jar >logs/survey1.log 2>&1 &
        sleep 20s
        nohup ${JAVA_BIN} -jar ${APP_HOME}/$1.jar >logs/survey2.log 2>&1 &
        sleep 20s
        nohup ${JAVA_BIN} -jar ${APP_HOME}/$1.jar >logs/survey3.log 2>&1 & tail -f ${APP_HOME}/logs/survey3.log
        echo "[$1] started successfully";
    else
        echo "Trying start $1"
        if [ $# == 2 ] && [ $2 == 0 ];then
            nohup ${JAVA_BIN} -jar ${APP_HOME}/$1.jar >logs/$1.log 2>&1 &
        else
            nohup ${JAVA_BIN} -jar ${APP_HOME}/$1.jar >logs/$2.log 2>&1 & tail -f ${APP_HOME}/logs/$2.log
        fi
        echo "[$1] started successfully";
    fi
}

stop_service(){
    SERVER_NAME=$1
    if [ $1 == 'all' ] || [ $1 == 'stop' ] || [ $1 == 'eureka' ] ;then
        SERVER_NAME=${APP_HOME}
    else
        SERVER_NAME=${APP_HOME}/${SERVER_NAME}
    fi

    pgrep -f ${SERVER_NAME} | xargs kill

    sleep 3s;

    pgrep -f ${APP_HOME}/logs | xargs kill
}

if [ $# -eq 1 ] ;then
    APP_NAME=$1
elif [ $# -eq 2 ] ;then
    APP_NAME=$1
    PROFILE=$2
fi

if [ ${PROFILE} == 'test' ];then
    JAVA_BIN=/e355/sdk/jdk1.8.0_77/bin/java
fi

stop_service ${APP_NAME}

if [ ${PROFILE} == '0' ];then
    APP_NAME="${APP_NAME} 0"
fi

start_service ${APP_NAME}
