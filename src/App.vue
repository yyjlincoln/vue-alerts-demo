<template>
  <div id="app">
    <alert></alert>
    <div>
      <button @click="newAlert(0)">Case 0</button>
      <button @click="newAlert(1)">Case 1</button>
      <button @click="newAlert(2)">Case 2</button>
      <button @click="newAlert(3)">Case 3</button>
      <button @click="newAlert(4)">Case 4</button>
      <button @click="newAlert(5)">Case 5</button>
      <button @click="newAlert(6)">Case 6</button>
      <button @click="newAlert(7)">Case 7</button>
      <button @click="newAlert(8)">Case 8</button>
      <button @click="newAlert(9)">Case 9</button>
      <button @click="newAlert(10)">Case 10</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "App",
  components: {},
  mounted() {},
  methods: {
    newAlert(style) {
      switch (style) {
        case 0:
          this.$alert.present(
            "Hello world!",
            "Vue-alerts test. Press enter or esc to dismiss."
          );
          break;
        case 1:
          this.$alert.present(
            "Delete file?",
            "This action can not be undone. Press esc or enter to cancel",
            [
              {
                title: "Cancel",
                type: "cancel",
              },
              {
                title: "Delete",
                type: "destructive",
                handler: () => {
                  this.$alert.present(
                    "Successfully deleted file.",
                    "The selected file had been deleted."
                  );
                },
              },
            ]
          );
          break;
        case 2:
          this.$alert.present(
            "Delete file?",
            "This action can not be undone. Press esc to cancel or press enter to delete",
            [
              {
                title: "Cancel",
                type: "cancel",
              },
              {
                title: "Delete",
                type: "destructive",
                handler: () => {
                  this.$alert.present(
                    "Successfully deleted file.",
                    "The selected file had been deleted."
                  );
                },
              },
            ],
            {
              defaultAction: 1,
            }
          );
          break;
        case 3:
          this.$alert.present(
            "Hello world!",
            "Vue-alerts test. Can not be dismissed using keyboard as there is no action of type 'cancel'.",
            [
              {
                title: "OK",
                type: "normal",
                handler: () => {},
              },
            ]
          );
          break;
        case 4:
          this.$alert.present(
            "Hello world!",
            "Get information about the alert in the handler function",
            [
              {
                title: "OK",
                type: "normal",
                handler: (identifier, actionIndex) => {
                  this.$alert.present(
                    "Previous identifier: " + identifier,
                    "Previous actionIndex: " + actionIndex
                  );
                },
              },
            ],
            {
              defaultAction: 0,
            }
          );
          break;
        case 5:
          this.$alert.present(
            "Delete file?",
            "Prevent the previous alert from auto-dismissing; A long action title",
            [
              {
                title: "Cancel",
                type: "cancel",
              },
              {
                title: "Delete... But a bit too long...",
                type: "destructive",
                handler: () => {
                  this.$alert.present(
                    "Successfully deleted file.",
                    "The selected file had been deleted."
                  );
                  return false; // Prevent the previous alert from auto-dismissing
                },
              },
            ],
            {
              defaultAction: 1,
            }
          );
          break;
        case 6:
          this.$alert.present(
            "Where do you want to save this file?",
            "Multiple actions with default.",
            [
              {
                title: "Desktop",
                type: "normal",
                handler: () => {},
              },
              {
                title: "Downloads",
                type: "normal",
                handler: () => {},
              },
              {
                title: "Music",
                type: "normal",
                handler: () => {},
              },
              {
                title: "Documents",
                type: "normal",
                handler: () => {},
              },
              {
                title: "Cancel and delete file",
                type: "destructive",
                handler: (identifier) => {
                  this.$alert.present(
                    "Cancel and delete file?",
                    "This action can not be undone.",
                    [
                      {
                        title: "Cancel",
                        type: "cancel",
                      },
                      {
                        title: "Delete",
                        type: "destructive",
                        handler: () => {
                          this.$alert.dismiss(identifier);
                          this.$alert.present(
                            "Successfully deleted file.",
                            "The selected file had been deleted."
                          );
                        },
                      },
                    ]
                  );
                  return false; // Prevent the previous alert from auto-dismissing
                },
              },
            ],
            {
              defaultAction: 0,
              defaultEscapeAction: 4,
            }
          );
          break;
        case 7:
          this.$alert.present(
            "Demo: Some unhandled error in handler",
            'This is only displayed as "developerMode: true" is passed through in Vue.use(vueAlerts, {...})',
            [
              {
                title: "Show me",
                type: "normal",
                handler: () => {
                  throw new Error("Error message");
                },
              },
            ]
          );
          break;
        case 8:
          this.$alert.present(
            "Where do you want so save the file?",
            "Lots of actions",
            [
              {
                title: "Option 1",
                type: "normal",
                handler: () => {},
              },
              {
                title: "Option 2",
                type: "normal",
                handler: () => {},
              },
              {
                title: "Option 3",
                type: "normal",
                handler: () => {},
              },
              {
                title: "Option 4",
                type: "normal",
                handler: () => {},
              },
              {
                title: "Option 5",
                type: "normal",
                handler: () => {},
              },
              {
                title: "Option 6",
                type: "normal",
                handler: () => {},
              },
              {
                title: "Option 7",
                type: "normal",
                handler: () => {},
              },
              {
                title: "Option 8",
                type: "normal",
                handler: () => {},
              },
              {
                title: "Option 9",
                type: "normal",
                handler: () => {},
              },
              {
                title: "Option 10",
                type: "normal",
                handler: () => {},
              },
              {
                title: "Cancel",
                type: "cancel",
              },
            ]
          );
          break;
        case 9:
          for (var x = 0; x < 10; x++) {
            this.$alert.present(
              "Alert #" + x,
              x + "x" + "5 = " + x * 5 + " (multiple alerts in a roll)"
            );
          }
          break;
        case 10:
          for (var i = 0; i < 10; i++) {
            this.$alert.present(
              "Alert #" + i,
              i + "x" + "5 = " + i * 5 + " Present and dismiss"
            );

            this.$alert.dismiss();
          }
      }
    },
  },
};
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap");
body {
  font-family: "Inter", sans-serif;
}
</style>
