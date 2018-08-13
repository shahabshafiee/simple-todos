import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
 
export const Tasks = new Mongo.Collection('tasks');

if (Meteor.isServer) {
    // This code only runs on the server
    Meteor.publish('tasks', function tasksPublication() {
        return Tasks.find({
            $or: [{
              private: {
                $ne: true
              }
            }, {
              owner: this.userId
            }, ],
          });
    });
  }

Meteor.methods({
    'tasks.insert' (text) {
      check(text, String);

      // Make sure the user is logged in before inserting a task
      if (!Meteor.userId()) {
        throw new Meteor.Error('not-authorized');
      }

         console.log('Meteor.userId():',Meteor.userId())
        //console.log("task: ",task)
         console.log("Meteor.user().username: ",Meteor.user().username)
        const randomId = Math.random();
      Tasks.insert({
        text,
        createdAt: new Date(),
        owner: Meteor.userId(),
        username: Meteor.user().username,
        private: false,
        randomId: randomId
      });
      console.log("randomId: ",randomId)
        const t1 = Tasks.findOne(
            {randomId: randomId}
        )
        console.log("user: ",t1.username," added ",t1 ," to the database")

    },
    'tasks.remove' (taskId) {
      check(taskId, String);
   
      const task = Tasks.findOne(taskId);
      console.log('task.owner:',task.owner)
        console.log('Meteor.userId():',Meteor.userId())
        console.log("task: ", task )
        console.log("task.private: ", task.private )
      // if (task.private && task.owner !== Meteor.userId()) {
          if (task.owner !== Meteor.userId()) {
        // If the task is private, make sure only the owner can delete it
        throw new Meteor.Error('not-authorized');
      }
   
      Tasks.remove(taskId);
    },
    'tasks.setChecked' (taskId, setChecked) {
      check(taskId, String);
      check(setChecked, Boolean);
 
      const task = Tasks.findOne(taskId);
      if (task.private && task.owner !== Meteor.userId()) {
        // If the task is private, make sure only the owner can check it off
        throw new Meteor.Error('not-authorized');
      }
   
   
      Tasks.update(taskId, {
        $set: {
          checked: setChecked
        }
      });
    },
    'tasks.setPrivate' (taskId, setToPrivate) {
        check(taskId, String);
        check(setToPrivate, Boolean);
     
        const task = Tasks.findOne(taskId);
     
        // Make sure only the task owner can make a task private
        if (task.owner !== Meteor.userId()) {
          throw new Meteor.Error('not-authorized');
        }
     
        Tasks.update(taskId, {
          $set: {
            private: setToPrivate
          }
        });
      },
  });