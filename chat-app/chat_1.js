import * as Vue from "https://unpkg.com/vue@3/dist/vue.esm-browser.js";
import { mixin } from "https://mavue.mavo.io/mavue.js";
import GraffitiPlugin from "https://graffiti.garden/graffiti-js/plugins/vue/plugin.js";
import Resolver from "./resolver.js";

const app = {
  // Import MaVue
  mixins: [mixin],

  // Import resolver
  created() {
    this.resolver = new Resolver(this.$gf);
  },

  setup() {
    // Initialize the name of the channel we're chatting in
    const channel = Vue.ref("default");

    // And a flag for whether or not we're private-messaging
    const privateMessaging = Vue.ref(false);

    // If we're private messaging use "me" as the channel,
    // otherwise use the channel value
    const $gf = Vue.inject("graffiti");
    const context = Vue.computed(() =>
      privateMessaging.value ? [$gf.me] : [channel.value]
    );

    // Initialize the collection of messages associated with the context
    const { objects: messagesRaw } = $gf.useObjects(context);
    return { channel, privateMessaging, messagesRaw };
  },

  data() {
    // Initialize some more reactive variables
    return {
      messageText: "",
      editID: "",
      editText: "",
      recipient: "",

      requestedUsername: "", // I added this
      usernameError: "", // I added this
      usernameSuccess: "", // I added this

      searchError: "", // I added this
      searchLoading: false, // I added this
      searchedUsername: "", // I added this

      usernames: {}, // I added this

      encounteredUsernames: [], //I added this

      showHelpModal: false, // I added this

      errorMessage: null, // I added this

      newMessagesCount: 0, // I added this
    };
  },

  computed: {
    // ########################## Messages #################################
    // ########################## Messages #################################
    messages() {
      let messages = this.messagesRaw
        // Filter the "raw" messages for data
        // that is appropriate for our application
        // https://www.w3.org/TR/activitystreams-vocabulary/#dfn-note
        .filter(
          (m) =>
            // Does the message have a type property?
            m.type &&
            // Is the value of that property 'Note'?
            m.type == "Note" &&
            // Does the message have a content property?
            m.content &&
            // Is that property a string?
            typeof m.content == "string"
        );

      // Do some more filtering for private messaging
      if (this.privateMessaging) {
        messages = messages.filter(
          (m) =>
            // Is the message private?
            m.bto &&
            // Is the message to exactly one person?
            m.bto.length == 1 &&
            // Is the message to the recipient?
            (m.bto[0] == this.recipient ||
              // Or is the message from the recipient?
              m.actor == this.recipient)
        );
      }

      return (
        messages
          // Sort the messages with the
          // most recently created ones first
          .sort((m1, m2) => new Date(m2.published) - new Date(m1.published))
          // Only show the 10 most recent ones
          .slice(0, 10)
      );
    },
    // ########################## filteredUsernames #################################
    // ########################## filteredUsernames #################################

    filteredUsernames() {
      const searchInput = this.searchedUsername.toLowerCase();
      return this.encounteredUsernames.filter((username) =>
        // username.toLowerCase().startsWith(searchInput)
        username ? username.toLowerCase().startsWith(searchInput) : null
      );
    },
  },

  methods: {
    formatDate(dateString) {
      const date = new Date(dateString);
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    },
    // togglePrivateMessaging() {
    //   this.privateMessaging = !this.privateMessaging;
    //   // if (this.privateMessaging) {
    //   //   this.privateMessaging = !this.privateMessaging;
    //   // } else {
    //   //   this.privateMessaging = this.privateMessaging;
    //   // }
    // },
    // ##########################  Notification #################################
    // ##########################  Notification #################################
    // ##########################  Notification #################################
    // playNotificationSound() {
    //   const audio = new Audio("new_text.mp3");
    // },
    // onMessageRecieved(message){

    // },
    incrementNewMessagesCount() {
      this.newMessagesCount += 1;
    },
    onMessageReceived(message) {
      // Call this method when a new message is received
      this.incrementNewMessagesCount();
      // Handle the received message
    },
    resetNewMessagesCount() {
      this.newMessagesCount = 0;
    },
    openChat() {
      // Call this method when the user opens or switches to the chat window
      this.resetNewMessagesCount();
      // Open the chat window or switch to it
    },
    // ##########################  toggleHelpModal #################################
    // ##########################  toggleHelpModal #################################
    // ##########################  toggleHelpModal #################################
    toggleHelpModal() {
      this.showHelpModal = !this.showHelpModal;
    },
    // ##########################  selectSuggestedUsername #################################
    // ##########################  selectSuggestedUsername #################################
    // ##########################  selectSuggestedUsername #################################
    selectSuggestedUsername(suggestedUsername) {
      this.searchedUsername = suggestedUsername;
      this.searchByUsername(); //automatically search when a suggestion is clicked

      this.searchedUsername = "";
    },

    // ########################## Fetch Username #################################
    // ########################## Fetch Username #################################
    // ########################## Fetch Username #################################

    async fetchUsername(actorId) {
      if (this.usernames[actorId]) {
        return this.usernames[actorId];
      } else {
        try {
          const username = await this.resolver.actorToUsername(actorId);
          // this.$set(this.usernames, actorId, username);
          this.usernames[actorId] = username;

          // Add the fetched username tot he encounteredUsername  array
          if (!this.encounteredUsernames.includes(username)) {
            this.encounteredUsernames.push(username);
          }
          return username;
        } catch (error) {
          console.error("Error fetching username:", error);
          return null;
        }
      }
    },

    // ########################## Request Username #################################
    // ########################## Request Username #################################
    // ########################## Request Username #################################
    requestUsername() {
      if (!this.requestedUsername) {
        this.usernameError =
          "Username Can not be Empty! Plase type a username.";
        setTimeout(() => {
          this.usernameError = "";
        }, 2000);
        return;
      }
      // call the appropriate resolver functiont to request username
      this.resolver
        .requestUsername(this.requestedUsername)
        .then((response) => {
          if (response === "success") {
            // clear the Username input and error message
            this.requestedUsername = "";
            this.usernameError = "";

            // display a text that the request succeded and disapear after a 1 sec ..
            // alert("username Successful!");
            this.usernameSuccess =
              "Congratulations! Your username request has been approved.";
            setTimeout(() => {
              this.usernameSuccess = "";
            }, 2000);
          } else {
            this.usernameError =
              "The User is name is taken. Please try another one!";
            setTimeout(() => {
              this.usernameError = "";
            }, 2000);
          }
        })
        .catch((error) => {
          // handles any other error that might occur
          this.usernameError =
            "An error occurred while requesting the username! Please try again.";
          setTimeout(() => {
            this.usernameError = "";
          }, 2000);
        });
    },

    // ########################## Search by Username #################################
    // ########################## Search by Username #################################
    // ########################## Search by Username #################################

    async searchByUsername() {
      this.searchError = "";
      this.searchLoading = true;

      try {
        const actorID = await this.resolver.usernameToActor(
          this.searchedUsername
        );
        // alert(actorID);
        // if the username is found update the recipient and set the search error to ""
        //other wise post error message for 2 sec
        if (actorID) {
          this.recipient = actorID;
          this.searchError = "";
        } else {
          this.searchError = "No matching username is found.";
          setTimeout(() => {
            this.searchError = "";
          }, 2000);
        }
      } catch (error) {
        this.searchError = "Error Searching for username.";
      } finally {
        this.searchLoading = false;
      }
    },

    // ########################## sendMessage() #################################
    // ########################## sendMessage() #################################
    // ########################## sendMessage() #################################

    sendMessage() {
      const message = {
        type: "Note",
        content: this.messageText,
      };

      // The context field declares which
      // channel(s) the object is posted in
      // You can post in more than one if you want!
      // The bto field makes messages private
      if (this.privateMessaging) {
        message.bto = [this.recipient];
        message.context = [this.$gf.me, this.recipient];
      } else {
        message.context = [this.channel];
      }

      // Send!
      this.$gf.post(message);

      this.messageText = "";
    },

    removeMessage(message) {
      this.$gf.remove(message);
    },

    startEditMessage(message) {
      // Mark which message we're editing
      this.editID = message.id;
      // And copy over it's existing text
      this.editText = message.content;
    },

    saveEditMessage(message) {
      // Save the text (which will automatically
      // sync with the server)
      message.content = this.editText;
      // And clear the edit mark
      this.editID = "";
    },

    // I added this line
    // startEditMessageNewButton(message) {
    //   this.startEditMessage(message);
    // },
  },
};

const Name = {
  props: ["actor", "editable"],

  setup(props) {
    // Get a collection of all objects associated with the actor
    const { actor } = Vue.toRefs(props);
    const $gf = Vue.inject("graffiti");
    return $gf.useObjects([actor]);
  },

  computed: {
    profile() {
      return (
        this.objects
          // Filter the raw objects for profile data
          // https://www.w3.org/TR/activitystreams-vocabulary/#dfn-profile
          .filter(
            (m) =>
              // Does the message have a type property?
              m.type &&
              // Is the value of that property 'Profile'?
              m.type == "Profile" &&
              // Does the message have a name property?
              m.name &&
              // Is that property a string?
              typeof m.name == "string"
          )
          // Choose the most recent one or null if none exists
          .reduce(
            (prev, curr) =>
              !prev || curr.published > prev.published ? curr : prev,
            null
          )
      );
    },
  },

  data() {
    return {
      editing: false,
      editText: "",
    };
  },

  methods: {
    editName() {
      this.editing = true;
      // If we already have a profile,
      // initialize the edit text to our existing name
      this.editText = this.profile ? this.profile.name : this.editText;
    },

    saveName() {
      if (this.profile) {
        // If we already have a profile, just change the name
        // (this will sync automatically)
        this.profile.name = this.editText;
      } else {
        // Otherwise create a profile
        this.$gf.post({
          type: "Profile",
          name: this.editText,
        });
      }

      // Exit the editing state
      this.editing = false;
    },
  },

  template: "#name",
};

app.components = { Name };
Vue.createApp(app).use(GraffitiPlugin(Vue)).mount("#app");
