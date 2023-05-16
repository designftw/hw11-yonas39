import * as Vue from "https://unpkg.com/vue@3/dist/vue.esm-browser.js";
import { mixin } from "https://mavue.mavo.io/mavue.js";
import GraffitiPlugin from "https://graffiti.garden/graffiti-js/plugins/vue/plugin.js";
import Resolver from "./resolver.js";
const API_KEY = "AIzaSyA3jLJjBvwVZXPfHJo7BIV2RXYFpfCkH48";
const app = {
  // Import MaVue
  mixins: [mixin],

  // Import resolver
  created() {
    this.resolver = new Resolver(this.$gf);

    // document.body.classList.add(this.theme);
  },

  setup() {
    // Initialize the name of the channel we're chatting in
    const channel = Vue.ref("default-demo");

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
    return { channel, privateMessaging, messagesRaw }; // Commented to test the code below

    // ############### Read Activity ####################
    // const { objects: readActivities } = $gf.useObjects(context);
    // return { channel, privateMessaging, messagesRaw, readActivities };
    // return { channel, privateMessaging, messagesRaw };
  },

  data() {
    // Initialize some more reactive variables
    return {
      messageText: "",
      editID: "",
      editText: "",
      recipient: "",

      // /////////////////////////////////////
      //  problem-1
      preferredUsername: "", // I added this
      usernameResult: "", // I added this

      // requestedUsername: "", // I added this
      // usernameError: "", // I added this
      // usernameSuccess: "", // I added this

      // Problem-2
      searchError: "", // I added this
      searchLoading: false, // I added this
      searchedUsername: "", // I added this
      recipientUsername: "", // I added this

      // problem-3
      myUsername: "", // I added this
      // actorToUsername: {}, //I added this
      actorsToUsernames: {}, //I added this
      //Sending Media in Chat
      file: null, // I added this
      downloadedImages: {}, // I added this

      // Need to double check the line below this
      usernames: {}, // I added this

      encounteredUsernames: [], //I added this

      showHelpModal: false, // I added this

      errorMessage: null, // I added this

      newMessagesCount: 0, // I added this

      privateMessages: {}, // I added this

      isTyping: false, // I added this

      textToTranslate: "", // I added this
      targetLanguage: "", // I added this
      translatedText: "", // I added this

      selectedLanguages: [], // I added this
      detectedLanguage: null, // I added this

      // theme: "light", // I added this

      deletedMessages: {},

      // messages: [],
      // targetLanguage: 'en',
      translatedMessages: {},

      showSettingsModal: false,
    };
  },
  // ################ Sending media in chat (watch) ###########
  watch: {
    "$gf.me": async function (me) {
      this.myUsername = await this.resolver.actorToUsername(me);
    },

    async messages(messages) {
      for (const m of messages) {
        if (!(m.actor in this.actorsToUsernames)) {
          this.actorsToUsernames[m.actor] = await this.resolver.actorToUsername(
            m.actor
          );
        }
        if (m.bto && m.bto.length && !(m.bto[0] in this.actorsToUsernames)) {
          this.actorsToUsernames[m.bto[0]] =
            await this.resolver.actorToUsername(m.bto[0]);
        }
      }
    },

    async messagesWithAttachments(messages) {
      for (const m of messages) {
        if (!(m.attachment.magnet in this.downloadedImages)) {
          this.downloadedImages[m.attachment.magnet] = "downloading";
          let blob;
          try {
            blob = await this.$gf.media.fetch(m.attachment.magnet);
          } catch (e) {
            this.downloadedImages[m.attachment.magnet] = "error";
            continue;
          }
          this.downloadedImages[m.attachment.magnet] =
            URL.createObjectURL(blob);
        }
      }
    },

    targetLanguage() {
      this.translateAllMessages();
    },
    messages: {
      deep: true,
      handler() {
        this.translateAllMessages();
      },
    },
    // ######### select languages not to be translated ##########
    selectedLanguages: {
      handler() {
        this.translateAllMessages();
      },
      deep: true,
    },

    // ################# app THEME ##################
    // theme(newValue) {
    //   document.body.classList.remove("light", "dark");
    //   document.body.classList.add(newValue);
    // },
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
            // m.content &&
            (m.content || m.content == "") &&
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

    // ################ Sending media in chat ###########
    // ################ Sending media in chat ###########
    messagesWithAttachments() {
      return this.messages.filter(
        (m) =>
          m.attachment &&
          m.attachment.type == "Image" &&
          typeof m.attachment.magnet == "string"
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
    // ######################### readActivities #######################
    // ######################### readActivities #######################
    readActivities() {
      return this.readActivities.filter((activity) => activity.type === "Read");
    },
  },

  methods: {
    // ##################################################################
    // ########################## Setting ###############################
    toggleSettingsModal() {
      this.showSettingsModal = !this.showSettingsModal;
    },

    // ##############################################################################
    // ############################### Language Translation #########################
    removeAllSelectedLanguages() {
      this.selectedLanguages = [];
    },

    removeLanguage(index) {
      this.selectedLanguages.splice(index, 1);
    },

    //  Detetect language
    async detectLanguage(messageContent) {
      try {
        const response = await axios.post(
          `https://translation.googleapis.com/language/translate/v2/detect?key=${API_KEY}`,
          {
            q: messageContent,
          }
        );

        if (
          response.data &&
          response.data.data &&
          response.data.data.detections &&
          // response.data.data.detections.length > 0
          response.data.data.detections.length > 0 &&
          response.data.data.detections[0].length > 0
        ) {
          return response.data.data.detections[0][0].language;
        } else {
          console.error("Language detection failed. Please try again.");
          return null;
        }
      } catch (error) {
        console.error("Error while detecting language:", error);
        return null;
      }
    },

    async translateMessage(messageContent) {
      // alert(selectedLanguages);
      if (!messageContent) {
        return messageContent;
      }

      const detectedLanguage = await this.detectLanguage(messageContent);
      this.detectedLanguage = detectedLanguage; // update the detected language

      if (
        !messageContent ||
        this.selectedLanguages.includes(detectedLanguage)
      ) {
        return messageContent;
      }

      try {
        const response = await axios.post(
          `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`,
          {
            q: messageContent,
            target: this.targetLanguage,
          }
        );

        if (
          response.data &&
          response.data.data &&
          response.data.data.translations &&
          response.data.data.translations.length > 0
        ) {
          return response.data.data.translations[0].translatedText;
        } else {
          console.error("Translation failed. Please try again.");
          return messageContent;
        }
      } catch (error) {
        console.error("Error while translating:", error);
        return messageContent;
      }
    },

    async translateAllMessages() {
      for (const message of this.messages) {
        const detectedLanguage = await this.detectLanguage(message.content);

        // Check if the detected language is in the selectedLanguages array
        // If so, don't translate the message
        if (this.selectedLanguages.includes(detectedLanguage)) {
          this.translatedMessages[message.id] = {
            translatedText: message.content, // Original message, not translated
            detectedLanguage: detectedLanguage,
          };
        } else {
          this.translatedMessages[message.id] = {
            translatedText: await this.translateMessage(message.content),
            detectedLanguage: detectedLanguage,
          };
        }
      }
    },

    // ###############################################################
    // ########## Sending media in chat ##############################
    onImageAttachment(event) {
      const file = event.target.files[0];
      this.file = file;
    },
    // ###### media END ############

    // ######### ... Typing  ############
    handleInputFocus() {
      this.isTyping = true;
    },
    handleInputBlur() {
      this.isBlur = false;
    },
    // #################################################################
    // ######## Date Format ############################################

    formatDate(dateString) {
      const date = new Date(dateString);
      const now = new Date();

      let formatString = "";

      if (date.getFullYear() !== now.getFullYear()) {
        // If the message is from a previous year, include the year in the date string.
        formatString = `${date.getFullYear()}/`;
      }

      // Add month and day
      formatString += `${date.getMonth() + 1}/${date.getDate()} `;

      // Add time
      formatString += `${date.getHours()}:${("0" + date.getMinutes()).slice(
        -2
      )}`; // this will ensure minutes are always 2 digits

      return formatString;
    },

    // ##########################  toggleHelpModal #################################
    // ##########################  toggleHelpModal #################################
    toggleHelpModal() {
      this.showHelpModal = !this.showHelpModal;
    },

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
    async setUsername() {
      try {
        this.usernameResult = await this.resolver.requestUsername(
          this.preferredUsername
        );
        this.myUsername = this.preferredUsername;
      } catch (e) {
        this.usernameResult = e.toString();
        setTimeout(() => {
          this.usernameResult = "";
        }, 3000);
      }
    },

    // ########################## Search by Username #################################
    // ########################## Search by Username #################################

    async searchByUsername() {
      this.searchError = "";
      this.searchLoading = true;

      try {
        // const actorID = await this.resolver.usernameToActor(
        //   this.searchedUsername

        const actorID = await this.resolver.usernameToActor(
          this.searchedUsername
        );
        // alert(actorID);
        // if the username is found update the recipient and set the search error to ""
        //other wise post error message for 2 sec
        if (actorID) {
          this.recipient = actorID;
          this.searchError = "";
          this.recipientUsername = this.searchedUsername;
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
      this.searchedUsername = "";
    },

    // ########################## sendMessage() #################################
    // ########################## sendMessage() #################################
    // ########################## sendMessage() #################################
    async sendMessage() {
      if (!this.messageText.trim() && !this.file) {
        this.errorMessage = "Empty message !";
        setTimeout(() => {
          this.errorMessage = "";
        }, 3000);
        return;
      }
      const message = {
        type: "Note",
        content: this.messageText,
      };

      if (this.file) {
        message.attachment = {
          type: "Image",
          magnet: await this.$gf.media.store(this.file),
        };
        this.messageText = "";
        this.file = null;
      }

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

      this.file = null;
      this.messageText = "";
    },

    //################# remove and confirmation for remove ##############
    confirmDelete(message) {
      if (window.confirm("Are you sure you want to delete this message?")) {
        this.$gf.remove(message);
      }
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
//############################ Like ##################################
const Like = {
  props: ["messageid"],

  setup(props) {
    const $gf = Vue.inject("graffiti");
    const messageid = Vue.toRef(props, "messageid");
    const { objects: likesRaw } = $gf.useObjects([messageid]);
    return { likesRaw };
  },

  computed: {
    likes() {
      return this.likesRaw.filter(
        (l) => l.type == "Like" && l.object == this.messageid
      );
    },

    numLikes() {
      // Unique number of actors
      return [...new Set(this.likes.map((l) => l.actor))].length;
    },

    myLikes() {
      return this.likes.filter((l) => l.actor == this.$gf.me);
    },
  },

  methods: {
    toggleLike() {
      if (this.myLikes.length) {
        this.$gf.remove(...this.myLikes);
      } else {
        this.$gf.post({
          type: "Like",
          object: this.messageid,
          context: [this.messageid],
        });
      }
    },
  },

  template: "#like",
};

// ############## Read indicator #########################
const Read = {
  // props: ["messageid"],
  props: ["messageid", "sender"],

  setup(props) {
    const $gf = Vue.inject("graffiti");
    const messageid = Vue.toRef(props, "messageid");
    const { objects: readsRaw } = $gf.useObjects([messageid]);
    return { readsRaw };
  },

  computed: {
    reads() {
      return this.readsRaw.filter(
        (r) => r.type == "Read" && r.object == this.messageid
      );
    },

    numReads() {
      // Unique number of actors
      return [...new Set(this.reads.map((r) => r.actor))].length;
    },

    myReads() {
      return this.reads.filter((r) => r.actor == this.$gf.me);
    },
  },

  methods: {
    markAsRead() {
      if (!this.myReads.length) {
        this.$gf.post({
          type: "Read",
          object: this.messageid,
          context: [this.messageid],
          // bto: [], // only the creator can see this object
        });
      }
    },
  },

  template: "#read",
};

//  ############ REPLY ###################

const Reply = {
  name: "Reply",
  props: ["messageid", "content", "sender"],
  data() {
    return {
      replyContent: "",
      showReplyForm: false,
      replyingToReply: null,
      editingReply: null,
      editText: "",
    };
  },
  setup(props) {
    const $gf = Vue.inject("graffiti");
    const messageid = Vue.toRef(props, "messageid");
    const { objects: repliesRaw } = $gf.useObjects([messageid]);
    return { repliesRaw };
  },
  computed: {
    replies() {
      return this.repliesRaw.filter(
        (r) => r.type == "Note" && r.inReplyTo == this.messageid
      );
    },
    repliedMessageSnippet() {
      return this.content.length > 30
        ? this.content.substring(0, 30) + "..."
        : this.content;
    },
  },
  methods: {
    // #####################################################################
    replyReplies(replyId) {
      return this.repliesRaw.filter(
        (r) => r.type == "Note" && r.inReplyTo == replyId
      );
    },
    sendReply() {
      if (this.replyContent.trim()) {
        const inReplyTo = this.replyingToReply
          ? this.replyingToReply.id
          : this.messageid;
        this.$gf.post({
          type: "Note",
          content: this.replyContent,
          inReplyTo: inReplyTo,
          context: [this.messageid],
          to: [this.sender],
        });
        this.replyContent = "";
        this.showReplyForm = false;
        this.replyingToReply = null;
      }
    },
    startReplyToReply(reply) {
      this.replyingToReply = reply;
      this.showReplyForm = true;
    },
    confirmDelete(reply) {
      if (window.confirm("Are you sure you want to delete this message?")) {
        this.removeReply(reply);
      }
    },
    removeReply(reply) {
      this.$gf.remove(reply);
    },
    startEditReply(reply) {
      this.editingReply = reply;
      this.editText = reply.content;
    },
    saveEditReply() {
      if (this.editText.trim()) {
        this.editingReply.content = this.editText;
        this.$gf.update(this.editingReply);
        this.editingReply = null;
      }
    },
  },
  template: "#reply",
};

// ################### Profile Picture ##########################

const ProfilePicture = {
  props: ["actor", "editable"],
  // components: {
  //   Reply,
  // },
  setup(props) {
    const { actor } = Vue.toRefs(props);
    const $gf = Vue.inject("graffiti");
    return $gf.useObjects([actor]);
  },

  computed: {
    profile() {
      return this.objects
        .filter(
          (m) =>
            m.type &&
            m.type == "Profile" &&
            m.image &&
            m.image.type == "Image" &&
            m.image.magnet
        )
        .reduce(
          (prev, curr) =>
            !prev || curr.published > prev.published ? curr : prev,
          null
        );
    },
  },

  data() {
    return {
      editing: false,
      fileInput: null,
      localImageUrl: null,
    };
  },

  watch: {
    async profile(newProfile, oldProfile) {
      if (newProfile && newProfile.image && newProfile.image.magnet) {
        const imageBlob = await this.$gf.media.fetch(newProfile.image.magnet);
        this.localImageUrl = URL.createObjectURL(imageBlob);
      } else {
        this.localImageUrl = null;
      }
    },
  },

  methods: {
    async editProfilePicture() {
      this.editing = true;
      this.fileInput = document.createElement("input");
      this.fileInput.type = "file";
      this.fileInput.accept = "image/*";
      this.fileInput.addEventListener("change", this.saveProfilePicture);
      this.fileInput.click();
    },

    async saveProfilePicture() {
      const file = this.fileInput.files[0];
      const magnet = await this.$gf.media.store(file);
      if (this.profile) {
        this.profile.image = { type: "Image", magnet: magnet };
      } else {
        this.$gf.post({
          type: "Profile",
          image: {
            type: "Image",
            magnet: magnet,
          },
        });
      }
      this.editing = false;
    },
    onPicture(event) {
      const file = event.target.files[0];
      this.file = file;
    },
  },

  template: "#profile-picture",
};

app.components = { Name, Like, Read, Reply, ProfilePicture };
// app.component("Name", Name);
// app.component("Like", Like);
// app.component("Read", Read);
// app.component("Reply", Reply);
// app.component("ProfilePicture", ProfilePicture);

Vue.createApp(app).use(GraffitiPlugin(Vue)).mount("#app");
