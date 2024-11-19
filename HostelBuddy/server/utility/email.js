import returnReminder from "./emailWithNodemailer/mail/templates/reminder.js"
import mailSender from "./emailWithNodemailer/mailSender.js";

export const sendEmail = (email, username, productName, ownerName, ownerEmail) => {
    try {
        const htmlContent = returnReminder(username, productName, ownerName, ownerEmail);
        mailSender(email, `Return reminder for ${productName}`, htmlContent)
            .then((res) => {
                console.log(`Email sent successfully to ${username}`)
            })
            .catch((error) => {
                console.log(`Problem sending email to ${username}: `, error)
            })
    } catch (error) {
        console.log("Error occurred in sending email: ", error)
    }
}