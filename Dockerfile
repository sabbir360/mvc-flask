FROM python:3.4
RUN mkdir /log && \
        mkdir /application
ADD . /application

RUN apt-get update && \
    apt-get install -y python-pip supervisor && \
    rm -rf /var/lib/apt/lists/*
COPY supervisord.conf /etc/supervisor/conf.d/
RUN pip2 install django==1.9.1 requests boto==2.34.0 twilio==3.6.7 phonenumbers==7.0.1 botocore==0.71.0 dynamo3==0.3.1 fb==0.4.0 django-dynamodb-sessions pyjwt django-cors-headers asyncoro
RUN pip3 install -r /application/requirements.txt
CMD supervisord -c /etc/supervisor/supervisord.conf -n
