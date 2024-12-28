#!/bin/bash

overseerVersion='2.0.0'
overseerDirectory=${PWD}'/overseer'
overseerExecutable='Overseer.Server'
overseerExecutablePath=${overseerDirectory}'/'${overseerExecutable}
overseerPID=$(ps auxf | grep ${overseerExecutable} | grep -v grep  | awk '{print $2}')
overseerZipFile=overseer_server_${overseerVersion}.zip
overseerZipUrl=https://github.com/michaelfdeberry/overseer/releases/download/${overseerVersion}/${overseerZipFile}
servicePath='/lib/systemd/system/overseer.service'

echo Installing Overseer...

# update the system
apt-get update

# install the prerequisites 
apt-get install curl libunwind8 gettext apt-transport-https

# download the latest and unzip the archive
wget $overseerZipUrl
unzip -o ${overseerZipFile}

#change the permissions of the executable
chmod 744 $overseerExecutablePath

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

# enable the service
systemctl enable overseer

# start the service
service overseer start

if [ ! -f /etc/nginx/sites-available/overseer ]; then
    read -p "Do you want to install a reverse proxy with Nginx? (y/n): " installNginx
else
    echo "Nginx configuration for Overseer already exists. Skipping prompt."
    installNginx="n"
fi

if [ "$installNginx" == "y" ]; then
    # install nginx
    apt-get install nginx
    
    # create a new nginx configuration file
    nginxConfigPath='/etc/nginx/sites-available/overseer'
    > $nginxConfigPath
    echo server { >> $nginxConfigPath
    echo '    listen 80;' >> $nginxConfigPath 
    echo '    location / {' >> $nginxConfigPath
    echo '        proxy_pass http://localhost:9000;' >> $nginxConfigPath
    echo '        proxy_http_version 1.1;' >> $nginxConfigPath
    echo '        proxy_cache_bypass $http_upgrade;' >> $nginxConfigPath
    echo '        proxy_set_header Upgrade $http_upgrade;' >> $nginxConfigPath
    echo '        proxy_set_header Connection keep-alive;' >> $nginxConfigPath
    echo '        proxy_set_header X-Forwarded-Proto $scheme;' >> $nginxConfigPath
    echo '        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;' >> $nginxConfigPath
    echo '        proxy_set_header Host $host;' >> $nginxConfigPath
    echo '    }' >> $nginxConfigPath
    echo } >> $nginxConfigPath

    # enable the new configuration by creating a symlink
    ln -s $nginxConfigPath /etc/nginx/sites-enabled/

    # test the nginx configuration
    nginx -t

    # restart nginx to apply the changes
    systemctl restart nginx

    echo "Nginx has been installed and configured as a reverse proxy."
    echo "This only provides a basic configuration. You may need to make additional changes to suit your needs."
else
    echo "Nginx installation skipped."
fi

echo Overseer installation has completed.
