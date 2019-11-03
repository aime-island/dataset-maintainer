# Samrómur dataset creator
### Downloads all clips from the Samrómur S3 bucket that have been voted valid

Add config file (AWS secret keys) for the Samrómur to the root file.

Install yarn (with npm)

Run the command "yarn" in project root to install dependencies

- To Build: yarn build
- To Start: yarn start
- To Build and Start: yarn run

To change it from a recurring job to an each-time callable service change the run
function in app.ts to call this.updateDataset(this.print) instead of this.startSchedule
