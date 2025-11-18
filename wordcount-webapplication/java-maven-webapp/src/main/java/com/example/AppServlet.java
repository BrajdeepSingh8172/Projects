package com.example;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet(name = "AppServlet", urlPatterns = {"/hello"})
public class AppServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("text/html;charset=UTF-8");
        resp.getWriter().write("<html><head><title>Hello</title></head><body>");
        resp.getWriter().write("<h1>Hello from Java Maven Webapp</h1>");
        resp.getWriter().write("<p>Context path: " + req.getContextPath() + "</p>");
        resp.getWriter().write("<p><a href=\"/\">Home</a></p>");
        resp.getWriter().write("</body></html>");
    }
}
