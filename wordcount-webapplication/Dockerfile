# Use Tomcat with Java 17
FROM tomcat:9-jdk17

# Clean default Tomcat apps
RUN rm -rf /usr/local/tomcat/webapps/*

# Copy the built WAR file from your Maven project
COPY java-maven-webapp/target/*.war /usr/local/tomcat/webapps/ROOT.war

# Expose Tomcat port
EXPOSE 8080

# Start Tomcat
CMD ["catalina.sh", "run"]
