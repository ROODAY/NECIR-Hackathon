NECIR Hackathon Webapp
=====

Webapp for the NECIR Hackathon on August 3rd. Allows users to view and categorize reports of political campaign contributions.

Made with the Google Material Design Lite framework and Google Firebase.

Plan
=====

- Finish front end
    + Don't connect to database. Use sample data for everything.
- Connect to database
    + Test out random sample of data
        * Keep note of which reports are accessed so they can easily be reverted
- Decide whether to reset and reload database or just revert values
- Show Mr. Musgrave

Database Structure
=====

root
- reports
    + Each contribution report, keyed by Report_ID.
- unfilteredIndices
    + Contribution report Report_IDs. IDs here indicate the report has not been reviewed.
- filteredIndices
    + Contribution report Report_IDs. IDs here indicate the report has been reviewed by a user.
-   adminReviewedIndices
    + Contribution report Report_IDs. IDs here indicate the report has been reviewed by an admin.
- currentlyAccessedIndices
    + Contribution report Report_IDs. IDs here indicate the report is currently being accessed by a user/admin.
- adminCode
    + Salt and Hashed code that is checked against admin code provided by users attempting to authenticate as admins.
- eventCode
    + code to register an account
- admins
    + UIDs of users marked as admins.

Application Flow
=====

- User opens app
- User authenticates using Google account
- If user is admin, user clicks Authenticate as Admin button in menu and provides admin code. If admin code matches the code on the database, the user's UID is saved in db/admins
- User is on Review Reports page.
    + Client queries database for all unfilteredIndices
        * unfilteredIndices is saved in localStorage to prevent further calls.
    + Client queries currentlyAccessedIndices for first Report_ID in unfilteredIndices
    + If report is not accessed, client indicates the report is accessed in currentlyAccessedIndices and downloads the report
    + User reviews report data and categorizes report. 
    + Client adds Report_ID to filteredIndices and removes it from unfilteredIndices and currentlyAccessedIndices. Client removes key from local copy of unfilteredIndices.
    + Repeat from step 2
- User is on View All Reports
    + User is shown arbitrary amount of report IDs from local copy of unfilteredIndices. (User may select to view 10, 25, 50, or 100 IDs at a time)
    + User may click on a key to bring up its report. (This includes whether or not it has been accessed or reviewed)
        * User may review report right there if applicable. Same flow as if on Review Reports page. (Show through Modal)
