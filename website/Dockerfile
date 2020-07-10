FROM python

RUN apt-get -y update

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Copy Python dependencies
COPY requirements.txt /usr/src/app/
RUN pip3 install -r /usr/src/app/requirements.txt

# Copy source project
COPY . /usr/src/app/

CMD python3 server.py