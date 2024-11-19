const returnReminder = (username, productName, ownerName, ownerEmail) => `<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>Product Return Reminder</title>
    <style>
        body {
            background-color: #ffffff;
            font-family: Arial, sans-serif;
            font-size: 16px;
            line-height: 1.4;
            color: #333333;
            margin: 0;
            padding: 0;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            text-align: center;
        }

        .logo {
            max-width: 200px;
            margin-bottom: 20px;
        }

        .message {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 20px;
        }

        .body {
            font-size: 16px;
            margin-bottom: 20px;
        }

        .cta {
            display: inline-block;
            padding: 10px 20px;
            background-color: #FF6B6B;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
            font-weight: bold;
            margin-top: 20px;
        }

        .support {
            font-size: 14px;
            color: #999999;
            margin-top: 20px;
        }

        .highlight {
            font-weight: bold;
        }
    </style>
</head>

<body>
    <div class="container">
        <a href="https://your-platform-link.com"><img class="logo" src="https://ucarecdn.com/719e886a-bce5-49ca-bee8-047de5431f31/-/preview/1000x266/" alt="Your Platform Logo"></a>
        <div class="message">Return Reminder</div>
        <div class="body">
            <p>Dear ${username},</p>
            <p>This is a reminder that the product <span class="highlight">${productName}</span> you borrowed from
                <span class="highlight">${ownerName}</span> has exceeded its borrowing period.</p>
            <p>Please return the product to <span class="highlight">${ownerName}</span> as soon as possible.</p>
        </div>
        <a href="mailto:${ownerEmail}" class="cta">Contact Owner</a>
        <div class="support">If you need any assistance, feel free to reach out to us at <a href="mailto:info@yourplatform.com">info@yourplatform.com</a>. We're happy to help!</div>
    </div>
</body>

</html>
`

export default returnReminder