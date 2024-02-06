/**
 * Give Lead Contact Login Access in Lead Contact section
 * 
 * @param {string} User user name
 * @param {string} Password user password
 * @param {string} YourAppLink website utl
 * @param {string} SupportEmail website admin mail 
 * @returns {string} email template
 */
exports.giveLeadContactLoginAccess = (User, Password,YourAppLink, SupportEmail) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            text-align: left;
        }

        .container {
            background-color: #ffffff;
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            color: #333;
        }

        h2 {
            color: #fe893a;
        }

        p {
            color: #555;
        }

        .logo {
            width: 20%;
            max-width: 200px; /* Adjust the max-width as needed */
            height: auto;
            margin-bottom: 20px;
        }

        .button {
            display: inline-block;
            padding: 8px 16px;
            background-color: #fe893a;
            text-decoration: none;
            color: #ffffff !important;
            border-radius: 5px;
            margin-top: 10px;
        }

        .footer {
            margin-top: 20px;
            text-decoration: none;
            color: #888;
        }
    </style>
</head>
<body>
    <div class="container">
        <img src="http://159.65.80.24/assets/img/Full_Logo.png" alt="Organization Logo" class="logo">
        <h2>Welcome to ERPWISE</h2>
        <p>Dear ${User},</p>
        <p>We are thrilled to welcome you to ERPWISE! Your journey with our platform has just begun, and we are excited to have you on board.</p>
        <p>Feel free to explore the features and functionalities tailored to meet your business needs.</p>
        <p>Password : <b>${Password}</b></p>
        <a href="${YourAppLink}" class="button">Get Started</a>
        <p class="footer">If you have any questions or need assistance, please contact our support team at ${SupportEmail}.</p>
    </div>
</body>
</html>
`;