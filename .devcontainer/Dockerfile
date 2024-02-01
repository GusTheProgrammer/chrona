# ------------------------------------------------------------------------
FROM node:18 AS base

ARG USER_ID=999
ARG GROUP_ID=999
ARG USER=build



# Install git for dev purposes
RUN apt-get update \
  && apt-get -yq install git sudo \
  && rm -rf /tmp/* /var/tmp/* \
  && apt-get clean

# Create a dev user where npm setup falls under
RUN groupadd -g 1001 dev \
  && useradd -m -l -g 1001 -u 1001 dev
USER dev

# Configure npm to use a global directory in the home dir
RUN mkdir ~/.npm-global \
  && npm config set prefix /home/dev/.npm-global \
  && echo 'export PATH=/home/dev/.npm-global/bin:$PATH' >> ~/.profile \
  && chmod -R 777 /home/dev/


ENV USER_ID=${USER_ID}
ENV GROUP_ID=${GROUP_ID}
ENV USER=${USER}

# Allow Node debugging port to be exposed

ENV DEBUG=5858
EXPOSE $DEBUG

# ------------------------------------------------------------------------
FROM base as nodejs-18-build-env

USER root
# Set up a passed user, with the option of building to specific uid/gid values
RUN ls -al
COPY  ./.devcontainer/entrypoint.sh ./entrypoint.sh
RUN chmod a+x ./entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]
CMD ["/bin/bash"]


