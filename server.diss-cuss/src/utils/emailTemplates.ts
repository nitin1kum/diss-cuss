export const emailTemplate = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Verify Your Email</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f7;
        color: #333;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background-color: #ffffff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
      }
      .header {
        background-color: #4f46e5;
        color: white;
        padding: 20px;
        text-align: center;
      }
      .content {
        padding: 30px;
        text-align: center;
      }
      .button {
        display: inline-block;
        margin-top: 20px;
        padding: 14px 24px;
        background-color: #4f46e5;
        color: white;
        text-decoration: none;
        border-radius: 6px;
        font-size: 16px;
      }
      .footer {
        padding: 20px;
        font-size: 14px;
        color: #999;
        text-align: center;
      }
      @media only screen and (max-width: 600px) {
        .content {
          padding: 20px;
        }
        .button {
          width: 100%;
          box-sizing: border-box;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Diss-Cuss</h1>
      </div>
      <div class="content">
        <h2>Verify Your Email</h2>
        <p>
          Thanks for signing up! Please confirm your email address by clicking the button below.
        </p>
        <a href="{{VERIFY_URL}}" class="button">Verify Email</a>
        <p style="margin-top: 30px;">
          If you didn't create an account, you can ignore this message.
        </p>
      </div>
      <div class="footer">
        &copy; 2025 Diss-cuss. All rights reserved.
      </div>
    </div>
  </body>
</html>
`;