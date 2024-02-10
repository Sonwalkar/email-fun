const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { simpleParser } = require("mailparser");
const sendEmailHandler = require("./sendMail");
const https = require("https");

const client = new S3Client();


module.exports.handler = async (event) => {
  try {
    for (const record of event.Records) {
      const bucket = record.s3.bucket.name;
      const key = record.s3.object.key;

      const getObjectInput = {
        Bucket: bucket,
        Key: key
      };

      const getObjectCommand = new GetObjectCommand(getObjectInput);
      const getObjectResponse = await client.send(getObjectCommand);

      const parsedMail = await simpleParser(getObjectResponse.Body);

      const emailInfo = {
        from: parsedMail.from?.value[0].address?.toLowerCase(),
        to: parsedMail.to?.value[0]?.address?.toLowerCase(),
        subject: parsedMail.subject,
        body: parsedMail.text
      };
      console.log("Received email Info:", emailInfo)

      const htmlContent = await getHtml(emailInfo.body.replace(/(\r\n|\n|\r)/gm, ""));
      console.log("Html Content:", htmlContent)

      const sendEmailResponse = await sendEmailHandler.sendEmail(emailInfo.from, htmlContent);
      console.log("Sent email:", sendEmailResponse);
    }

    return {
      statusCode: 200,
      body: JSON.stringify("Email processing completed.")
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify("An error occurred during email processing.")
    };
  }
};


const getHtml = (url) => {
  if (url.length) {
    return new Promise((resolve, rejects) => {
      https.get(url, (res) => {
        let htmlContent = '';

        res.on('data', (chunk) => {
          htmlContent += chunk.toString();
        });

        res.on("end", () => {
          resolve(htmlContent);
        })
      }).on('error', (err) => {
        console.error(err);
        resolve(`<html>
          <head>
          <title>Email Fun website</title>
          </head>
          <body>
          <h1>Email Fun website</h1>
          <p> Error occurred while fetching the website. </p>
          </body>
          </html>`)
      })
    })
  }
  return `<!DOCTYPE html>
  <html>
  <head>
  <title>Email Fun website</title>
  </head>
  <body>
  <h1>Email Fun website</h1>
  <p> you can send a website link in the body to get the website page in the email</p>
  </body>
  </html>`
}
