#!/bin/bash -e
echo Creating user ${USER} in entrypoint script
# To avoid file permission issues when the container writes to the host,  
# we need a  user that has the same user and group ID as the host user.
# Changing the user and group IDs of the existing node user is _very_ slow in Docker.
groupadd -g ${GROUP_ID} ${USER} || true
useradd -m -l -g ${GROUP_ID} -u ${USER_ID} ${USER} || true
export PATH=/home/dev/.npm-global/bin:$PATH
echo 'export PATH=/home/dev/.npm-global/bin:$PATH' >> /home/${USER}/.bashrc 

# Local dev environments will map to here.
mkdir -p /home/${USER}/app
chmod -R a+rw /home/${USER}
cd /home/${USER}/app

# Start the container, passing through any parameters that have been supplied.
echo Running command: "$@"
runuser -u ${USER} -- "$@"