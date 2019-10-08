# README
First of all, install yarn (with npm)
Run the command "yarn" to install dependencies

To Build: yarn build
To Start: yarn start
To Build and Start: yarn run

To change it from a recurring job to a callable service change the run
function in app.ts to call this.updateDataset(this.print) instead of this.startSchedule