const cron = require('node-cron');
// const db = require("../db/db");
const User = require('../models/user.model.js');
const Email = require('../models/email.model.js');
const sendEmail = require('./nodemailer.js');

const sendCronEmails = () => {
    cron.schedule('52 10 * * *', async () => {
        try
        {  
            let now = new Date();
            let currentDay = now.getDate();
            let currentMonth = now.getMonth() + 1;
            
            const todayUsers = await User.find({
                DOB: { $regex: `^${currentDay.toString().padStart(2, '0')}/${currentMonth.toString().padStart(2, '0')}`, $options: 'i' }
            });
            
            let tomorrowDay = currentDay + 1;
            
            if(currentMonth == 2 && currentDay == 28)
                currentMonth++;
            else if((currentMonth == 4 ||currentMonth == 6 || currentMonth == 9 || currentMonth == 11) && currentDay == 30)
                currentMonth++;
            else
                currentMonth++;

            let tomorrowMonth = currentMonth;

            const tomorrowUsers = await User.find({
                DOB: { $regex: `^${tomorrowDay.toString().padStart(2, '0')}/${tomorrowMonth.toString().padStart(2, '0')}`, $options: 'i' }
            });

            console.log(todayUsers, "\n", tomorrowUsers);

            const emails = await Email.find({});
            console.log(emails);

            const getFormattedDate = (date) => {
                const day = ('0' + date.getDate()).slice(-2);
                const month = ('0' + (date.getMonth() + 1)).slice(-2);
                const year = date.getFullYear();
                return `${day}/${month}/${year}`;
            };
            
            const today = new Date();
            const tomorrow = new Date();
            tomorrow.setDate(today.getDate() + 1);
            
            const todayFormatted = getFormattedDate(today);
            const tomorrowFormatted = getFormattedDate(tomorrow);
            
            console.log(`Today: ${todayFormatted}`);
            console.log(`Tomorrow: ${tomorrowFormatted}`);
            

            emails.forEach(async (email) => {
                const usersHTML = `
                    <html>
                    <head></head>
                    <body>
                        <h2>Tomorrow - ${tomorrowFormatted}</h2>
                        <table border="5">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>ID</th>
                                    <th>NAME</th>
                                    <th>GENDER</th>
                                    <th>BRAMCH</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tomorrowUsers.map((user, index) => `
                                    <tr>
                                        <td>${index+1}</td>
                                        <td>${user.ID}</td>
                                        <td>${user.NAME}</td>
                                        <td>${user.GENDER}</td>
                                        <td>${user.BRANCH}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </body>
                    </html>

                    <br/>
                    <br/>
                    <hr>
                    <hr>
                    <br/>
                    <br/>

                    <html>
                    <head></head>
                    <body>
                        <h2>Today - ${todayFormatted}</h2>
                        <table border="5">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>ID</th>
                                    <th>NAME</th>
                                    <th>GENDER</th>
                                    <th>BRAMCH</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${todayUsers.map((user, index) => `
                                    <tr>
                                        <td>${index+1}</td>
                                        <td>${user.ID}</td>
                                        <td>${user.NAME}</td>
                                        <td>${user.GENDER}</td>
                                        <td>${user.BRANCH}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </body>
                    </html>

                    <br/>
                    <br/>
                    <br/>
                    <hr>
                    <h1>Made With Pain</h1>
                    <hr>
                `
                ;
            
                await sendEmail(
                    email.email,
                    'List of BirthDay\'s',
                    usersHTML
                );
            });

            console.log(`List of users ${emails.length} \n email addresses: ${emails}.`);
        }
        catch(error)
        {
            console.error('Error sending', error);
        }
    });
};

module.exports = sendCronEmails;