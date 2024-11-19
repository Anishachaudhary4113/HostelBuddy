import cron from 'node-cron';
import { sendEmail } from './email.js';



export const scheduleDailyTaskAt11AM = (task) => {
    cron.schedule('0 11 * * *', () => {
        console.log('Running scheduled task at 11 AM');
        task();
    });
}

async function getEmailsForOverdueOrders() {
    const currentDate = new Date();

    try {
        const overdueOrders = await Order.aggregate([
            {
                $addFields: {
                    daysDifference: {
                        $divide: [{ $subtract: [currentDate, '$pickupDate'] }, 1000 * 60 * 60 * 24],
                    },
                },
            },
            {
                $match: {
                    $expr: {
                        $gt: ['$daysDifference', '$noOfDays'],
                    },
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'borrower',
                    foreignField: '_id',
                    as: 'borrowerDetails',
                },
            },
            {
                $unwind: '$borrowerDetails',
            },
            {
                $project: {
                    email: '$borrowerDetails.email',
                },
            },
        ]);

        return overdueOrders.map(order => order.email);

    } catch (error) {
        console.error('Error fetching overdue orders:', error);
        throw error;
    }
}

export const myTask = () => {
    try {
        getEmailsForOverdueOrders().then(emails => {
            emails.map(email => {
                sendEmail(email)
            })
        }).catch(error => {
            console.error('Error sending email:', error);
        });
    } catch(erorr) {
        console.log("Error")
    }
}
