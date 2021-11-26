<template>
  <div>
    <transition-group name="alertTransition" tag="div">
      <div
        v-for="(alert, identifier) in alerts"
        :key="alert.identifier"
        :style="
          'position: fixed; width: 100%; height: 100%; top: 0px; left: 0px; display: flex; flex-direction: column; justify-content: center; z-index: ' +
          String(100000000 + (alert.stackLevel ? alert.stackLevel : 0)) +
          '; background: transparent; background-color: rgba(0, 0, 0, 0.3);'
        "
        :ref="'alert_' + identifier"
      >
        <div
          style="
            display: flex;
            flex-direction: column;
            background-color: white;
            width: fit-content;
            margin-left: auto;
            margin-right: auto;
            text-align: center;
            width: 350px;
            border-radius: 1em;
            max-height: 80%;
            filter: drop-shadow(0px 0px 1em rgba(0, 0, 0, 0.2));
            opacity: 1;
            font-size: 1.2em;
            overflow-wrap: break-word;
            overflow-y: auto;
            overflow-x: hidden;
          "
        >
          <div style="display: flex; flex-direction: column">
            <div style="padding: 1.5em 1.5em 0em 1.5em">
              <!-- Alert title and Content -->
              <div style="font-weight: bold; white-space: pre-wrap">
                <!-- Title -->
                {{ alert.title }}
              </div>
              <div
                style="
                  font-weight: plain;
                  margin-top: 0.5em;
                  white-space: pre-wrap;
                  user-select: none;
                "
              >
                <!-- Title -->
                {{ alert.message }}
              </div>
            </div>
            <div
              style="
                margin: 1em 0em 0em 0em;
                display: flex;
                overflow-x: hidden;
                overflow-y: auto;
                user-select: none;
              "
              :style="
                alert.actions.length == 2
                  ? 'flex-direction: row; justify-content: space-evenly; flex-wrap: wrap;'
                  : 'flex-direction: column;'
              "
            >
              <div
                v-for="(action, index) in alert.actions"
                :key="index"
                style="
                  position: relative;
                  flex-grow: 1;
                  max-width: 100%;
                  min-width: 50%;
                "
                :style="
                  index == alert.actions.length - 1 && alert.actions.length != 2
                    ? 'border-radius: 0 0 1em 1em;'
                    : ''
                "
                class="alertAction"
              >
                <div
                  v-if="
                    action.type == 'normal' ||
                    action.type == 'cancel' ||
                    action.type == 'destructive'
                  "
                >
                  <div
                    style="
                      padding: 0.7em 0.7em 0.7em 0.7em;
                      border-top: 0.1px solid rgba(0, 0, 0, 0.1);
                      cursor: pointer;
                      overflow-wrap: break-word;
                      text-align: center;
                      user-select: none;
                    "
                    :style="
                      alert.actions.length == 2
                        ? 'border-left: 0.1px solid rgba(0, 0, 0, 0.1); '
                        : ' '
                    "
                    :class="
                      getActionStyleClassess(action.type, identifier, index)
                    "
                    @click="handlerProxy(identifier, index)"
                  >
                    {{ action.title }}
                  </div>
                </div>
                <!-- <div v-if="action.type"></div> -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script>
class Queue {
  constructor() {
    this.internal_queue = [];
    this.autoDequeue = true;
  }
  queue(callback) {
    this.internal_queue.push(callback);
    if (this.autoDequeue) {
      this.autoDequeue = false;
      this.dequeue();
    }
  }
  dequeue() {
    // console.log('dequeue', this.internal_queue);
    if (this.internal_queue.length > 0) {
      let item = this.internal_queue.shift();
      // alert("Queue");
      item();
    } else {
      this.autoDequeue = true;
    }
  }
}
window.Queue = Queue;
import Vue from "vue";
export default {
  data: () => ({
    alerts: {},
    alertStack: [],
    alertQueue: new Queue(),
    stackLevel: 0,
    developerMode: false,
    presentBlockTime: 100,
    dismissBlockTime: 100, // 300 ms is the time taken for the transition to finish
  }),
  mounted() {
    this.$alert.instance = this;
    console.log(this.$alert);
    window.addEventListener(
      "keydown",
      ((that) => {
        return (event) => {
          if (Object.keys(that.alerts).length != 0) {
            let currentAlert =
              that.alerts[that.alertStack[that.alertStack.length - 1]];
            if (
              event.keyCode === 13 &&
              event.ctrlKey === false &&
              event.altKey === false &&
              event.shiftKey === false
            ) {
              // Trigger default action
              if (currentAlert.defaultAction != null) {
                that.handlerProxy(
                  currentAlert.identifier,
                  currentAlert.defaultAction
                );
              }
              event.preventDefault();
              return false;
            } else if (
              event.keyCode === 27 &&
              event.ctrlKey === false &&
              event.altKey === false &&
              event.shiftKey === false
            ) {
              let cancelIndex = currentAlert.defaultEscapeAction;
              if (cancelIndex != null) {
                that.handlerProxy(currentAlert.identifier, cancelIndex);
              }
            } else {
              if (currentAlert.preventKeyboard === true) {
                event.preventDefault();
                return false;
              }
            }
          }
        };
      })(this)
    );
  },
  methods: {
    async present(
      title,
      message,
      // type supports destructive, normal and cancel
      actions = [
        {
          title: "OK",
          handler: null,
          type: "cancel",
        },
      ],
      {
        defaultAction = null, // If defaultAction is null and a cancel action is present, then that first cancel action becomes the default. Otherwise, the alert can not be dismissed via enter.
        defaultEscapeAction = null, // If null and a cancel action is present, then that first cancel action becomes the default. Otherwise, the alert can not be dismissed via esc.
        preventKeyboard = true,
        allowMultipleClicks = false,
        immediately = false,
      } = {}
    ) {
      let prom = new Promise((resolve) => {
        let identifier = Math.floor(Math.random() * 10000000);
        let executePresent = ((that) => {
          return () => {
            // alert("Present Queue diapatched");
            for (var i = 0; i < actions.length; i++) {
              if (actions[i].type == "cancel") {
                actions[i].handler = () => {
                  that.dismissInline(identifier);
                  // although the alert will automatically be dismissed after an option is clicked, we still want to dismiss it here to ensure it really gets dismissed
                };
              }
            }
            this.stackLevel = this.stackLevel + 1; // increment the stack level
            Vue.set(that.alerts, identifier, {
              identifier: identifier,
              title: title,
              message: message,
              stackLevel: this.stackLevel,
              actions: actions,
              defaultAction:
                defaultAction != null
                  ? defaultAction
                  : this.getCancelAction(actions),
              defaultEscapeAction: defaultEscapeAction
                ? defaultEscapeAction
                : this.getCancelAction(actions),
              preventKeyboard: preventKeyboard,
              preventHandlerCalls: false,
              allowMultipleClicks: allowMultipleClicks,
            });
            that.alertStack.push(identifier);
            Vue.nextTick(function () {
              that.$refs["alert_" + identifier][0].focus();
            }, that);
            setTimeout(() => {
              that.alertQueue.dequeue();
              resolve(identifier);
            }, that.presentBlockTime);
          };
        })(this);
        if (immediately) {
          executePresent();
        } else {
          this.alertQueue.queue(executePresent);
        }
      });
      return prom;
    },
    async dismiss(identifier = null, { immediately = false } = {}) {
      let prom = new Promise((resolve) => {
        let executeDismiss = ((that) => {
          // alert("Queued: Dismissal");
          return () => {
            // alert("Dismiss Queue diapatched");
            if (identifier == null) {
              identifier = this.alertStack[this.alertStack.length - 1];
            }
            if (that.alerts[identifier] == undefined) {
              that.alertQueue.dequeue();
              resolve(false);
              return;
            }
            identifier = parseInt(identifier, 10);
            Vue.delete(that.alerts, identifier);
            that.alertStack.splice(that.alertStack.indexOf(identifier), 1);
            Vue.nextTick(() => {
              setTimeout(() => {
                that.alertQueue.dequeue();
                resolve(true);
              }, 300);
            });
            // Checks if the stackLevel can be resetted.
            if (Object.keys(that.alerts).length == 0) {
              // Resets the stackLevel when there is no more active alerts
              this.stackLevel = 0;
            }
          };
        })(this);
        if (immediately) {
          executeDismiss();
        } else {
          this.alertQueue.queue(executeDismiss, immediately);
        }
      });
      return prom;
    },
    dismissInline(identifier) {
      // When the user chooses to dismiss the alert, we want to do so immediately.
      this.dismiss(identifier, { immediately: true });
    },
    getActionStyleClassess(type, identifier, actionIndex) {
      let ActionStyles = {
        normal: ["normal"],
        cancel: ["normal"],
        destructive: ["destructive"],
      };
      let classess = ActionStyles[type];
      if (this.alerts[identifier].defaultAction === actionIndex) {
        classess.push("defaultAction");
      } else {
        classess.push("normalAction");
      }
      return classess;
    },
    async asyncCall(fx, ...args) {
      return (async () => {
        return fx(...args); // Will resolve immediately if the function is not async, or otherwise will resolve when the async function resolves.
      })().catch((e) => {
        // Using this method so that that fx is wrapped with an async function and its error is always handled within this function.
        console.log(e);
        if (this.developerMode) {
          console.log(fx)
          this.present(
            "[Developer] An internal error occured with the alertbox handler.",
            "While executing the alert action handler: " +
              fx +
              "\n\n" +
              e +
              "\n\n This has been printed in the console."
          );
        }
      });
    },
    handlerProxy(identifier, actionIndex) {
      let currentAlert = this.alerts[identifier];
      if (!currentAlert) {
        return;
      }
      if (currentAlert.preventHandlerCalls === true) {
        return;
      }
      if (currentAlert.allowMultipleClicks === false) {
        currentAlert.preventHandlerCalls = true;
      }
      this.asyncCall(
        currentAlert.actions[actionIndex].handler,
        identifier,
        actionIndex
      ).then((dismiss) => {
        if (dismiss === false) {
          currentAlert.preventHandlerCalls = false;
          return;
        }
        this.dismiss(identifier, { immediately: true });
        // Important Notes:
        // The reason why we want to dismiss immediately here:
        // - The handler takes quite a bit of time to execute
        // - In the handler, it will usually present other alerts - this adds to the queue - and we are waiting for the handler to return a result before we actually dismiss the previous one.
        // - We don't want to wait for the new alert to appear before dismissing the previous one - it will be ugly and the user will see twice the shadow flashing for [this.dismissBlockTime].
      });
      return;
    },
    getCancelAction(actions) {
      let decidedAction = null;
      for (var actionIndex = 0; actionIndex < actions.length; actionIndex++) {
        if (actions[actionIndex].type == "cancel") {
          decidedAction = actionIndex;
          break;
        }
      }
      return decidedAction;
    },
  },
};
</script>

<style scoped>
::-webkit-scrollbar {
    width: 0;  /* Remove scrollbar space */
    background: transparent;  /* Optional: just make scrollbar invisible */
}
.alertAction:hover {
  background-color: rgba(0, 0, 0, 0.1);
}
.alertAction:active {
  background-color: rgba(0, 0, 0, 0.2);
}
.alertTransition-enter-active,
.alertTransition-leave-active {
  transition: all 0.3s cubic-bezier(0.075, 0.82, 0.165, 1);
}
.alertTransition-enter
/* .list-leave-active for below version 2.1.8 */ {
  opacity: 0;
  transform: scale(1.2);
}
.alertTransition-leave-to {
  opacity: 0;
}
.destructive {
  color: #f34213;
}
.normal {
  color: #2364aa;
}
.defaultAction {
  font-weight: bolder;
}
.normalAction {
  font-weight: 600;
}
</style>