// <!-- <li>From: <name :actor="message.actor"></name></li> -->
// <!-- <li>From Actor ID: {{ message.actor }}</li> -->
// <!-- <template v-if="privateMessaging">
// <li>To Name: <name :actor="message.bto[0]"></name></li> -->
// <!-- <li>To Actor ID: {{ message.bto[0] }}</li> -->
// <!-- </template> -->

// <!-- <li>Published at Time: {{ message.published }}</li> -->
// <!-- <li>Last Edited at Time: {{ message.updated }}</li> -->

// <!-- This is a unique identifier that can be used to "link" to messages -->
// <!-- <li>ID: {{ message.id }}</li> -->

// <!-- <like :messageid="message.id"></like> -->
// <!-- ########## Like ############ -->

// ######### Like ######
// const Like = {
//   props: ["messageid"],

//   setup(props) {
//     const $gf = Vue.inject("graffiti");
//     const messageid = Vue.toRef(props, "messageid");
//     const { objects: likesRaw } = $gf.useObjects([messageid]);
//     return { likesRaw };
//   },

//   computed: {
//     likes() {
//       return this.likesRaw.filter(obj => obj.type === 'Like' && obj.object === this.messageid);
//     }
//   }
//   methods: {
//     sendLike() {
//       const like = {
//         type: "Like",
//         object: this.messageid,
//         context: [this.messageid],
//       };
//       this.$gf.post(like);
//     },
//   },
//   template: "#like",
// };
// app.components = { Name, Like };

// <!-- <div id="like">
// <button v-if="myLikes.length === 0" @click="sendLike">
//   Like ({{ likes.length }})
// </button>
// <button v-else @click="removeLike">
//   Dislike ({{ likes.length }})
// </button>
// </div> -->
// <!-- <div class="message-timestamp">
// <span>Published at Time: {{ message.published }}</span>
// </div> -->

// <!-- ############### a form to send message ##############################-->
// <!-- ############### a form to send message ##############################-->
// <!-- A form for sending messages -->
// <!-- <form @submit.prevent="sendMessage" class="send-button">
//   <input v-model="messageText" placeholder="Type a message..." />
//   <input class="button" type="submit" value="Send" />
// </form> -->
// <!-- <p v-else>
// <label for="recipient">
//   Paste the Actor ID of who you'd like to chat with:
// </label>
// <input id="recipient" v-model="recipient" />
// </p> -->

// <!-- <div class="private-public">

//         <input
//           type="radio"
//           id="channel"
//           :value="false"
//           v-model="privateMessaging"
//         />
//         <label for="channel">Public Post</label>

//         <input type="radio" id="pm" :value="true" v-model="privateMessaging" />
//         <label for="pm">Private Chat</label> -->

//       <!-- ###################### the number of unread messages ################# -->
//       <!-- <span class="unread-messages" v-if="unreadMessages">
//             ({{ unreadMessages }} new message{{ unreadMessages > 1 ? 's' : '' }})
//           </span> -->
//       <!-- </div> -->
//       <!-- ############### Setting, Edit-profile, New Message  #################################-->
//       <!-- ############### Setting, Edit-profile, New Message  #################################-->
//       <!-- <div class="top-buttons">
//         <button class="setting-btn">Setting</button>
//         <button class="edit-btn">Edit</button>
//         <button class="new-message-btn">New-Message</button>
//       </div> -->
