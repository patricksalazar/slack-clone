FROM node:12
WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN yarn install

# Install envsubst
# RUN apt-get update && apt-get install -y gettext-base
# COPY ./custom-entrypoint /usr/local/bin/
# RUN chmod u+x /usr/local/bin/custom-entrypoint
# ENTRYPOINT ["custom-entrypoint"]
# RUN mkdir /usr/src/app/static/

COPY mysite.template .
COPY dist .
COPY wait-for-it.sh .
CMD node index.js
