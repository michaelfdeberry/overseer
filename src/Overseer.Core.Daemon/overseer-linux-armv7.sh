#!/bin/bash

overseerVersion='1.0.0'
overseerDirectory=${PWD}'/overseer'
overseerExecutable='Overseer.Daemon'
overseerExecutablePath=${overseerDirectory}'/'${overseerExecutable}
overseerPID=$(ps auxf | grep ${overseerExecutable} | grep -v grep  | awk '{print $2}')
overseerZipUrl=https://github.com/michaelfdeberry/overseer/releases/download/${overseerVersion}/overseer-linux-armv7.zip
servicePath='/lib/systemd/system/overseer.service'

echo Installing Overseer...

# update the system
apt-get update

# install the prerequisites 
apt-get install curl libunwind8 gettext apt-transport-https

if [ -n "${overseerPID}" ]; then     
    # stop the service if it's is running
    service overseer stop
    
    # also send the kill command in case it was running manually
    kill ${overseerPID} 
fi

# create or overwrite the service file
> $servicePath
echo [Unit] >> $servicePath
echo Description=Overseer Daemon >> $servicePath
echo >> $servicePath
echo [Service] >> $servicePath
echo WorkingDirectory=${overseerDirectory} >> $servicePath
echo ExecStart=${overseerExecutablePath} >> $servicePath
echo Restart=alsways >> $servicePath
echo RestartSec=10 >> $servicePath
echo KillSignal=SIGINT >> $servicePath
echo SyslogIndentifier=overseer >> $servicePath
echo Environment=ASPNETCORE_ENVIRONMENT=Production >> $servicePath
echo Environment=DOTNET_PRINT_TELEMETRY_MESSAGE=false >> $servicePath
echo >> $servicePath
echo [Install] >> $servicePath
echo WantedBy=multi-user.target >> $servicePath
echo >> $servicePath

# download the latest and unzip the archive
wget $overseerZipUrl && unzip -o overseer.zip

#change the permissions of the executable
chmod 744 $overseerExecutablePath

# enable the service
systemctl enable overseer

# start the service
service overseer start

echo Overseer installation has completed.