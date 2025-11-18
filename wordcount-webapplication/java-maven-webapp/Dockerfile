FROM tomcat:9.0-jdk11
ARG WAR_FILE=target/java-maven-webapp.war

# Remove default webapps to keep image clean
RUN rm -rf /usr/local/tomcat/webapps/*

# Copy the WAR into Tomcat webapps
COPY ${WAR_FILE} /usr/local/tomcat/webapps/ROOT.war

EXPOSE 8080

CMD ["catalina.sh", "run"]
