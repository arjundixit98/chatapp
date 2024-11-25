console.log("Hello");
const sendBtn = document.getElementById("send-btn");
const inputMsg = document.getElementById("message");

const socket = io({ autoConnect: false });
socket.auth = { username, fullname };
socket.connect();

socket.onAny((event, ...args) => {
  console.log(event, args);
});

const displaySentMessage = ({ sender, message }) => {
  sender = sender.slice(0, 2).toUpperCase();
  const parentGrid = document.getElementById("main-grid");
  const topGrid = document.getElementById("top-grid");
  const newMessageDiv = document.createElement("div");
  newMessageDiv.classList.add("col-start-6", "col-end-13", "p-3", "rounded-lg");
  newMessageDiv.innerHTML = `
      <div class="flex items-center justify-start flex-row-reverse">
        <div class="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500 flex-shrink-0">
          ${sender}
        </div>
        <div class="relative mr-3 text-sm bg-indigo-100 py-2 px-4 shadow rounded-xl">
          <div>${message}</div>
        </div>
       </div>
    `;

  parentGrid.appendChild(newMessageDiv);
  topGrid.scrollTop = topGrid.scrollHeight;
};

const displayReceivedMessage = ({ sender, message }) => {
  sender = sender.slice(0, 2).toUpperCase();
  const parentGrid = document.getElementById("main-grid");
  const topGrid = document.getElementById("top-grid");
  const newMessageDiv = document.createElement("div");
  newMessageDiv.classList.add("col-start-1", "col-end-8", "p-3", "rounded-lg");
  newMessageDiv.innerHTML = `
      <div class="flex items-center flex-row">
        <div class="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500 flex-shrink-0">
          ${sender}
        </div>
        <div class="relative ml-3 text-sm bg-white py-2 px-4 shadow rounded-xl">
          <div>${message}</div>
        </div>
       </div>
    `;

  parentGrid.appendChild(newMessageDiv);
  topGrid.scrollTop = topGrid.scrollHeight;
};

const clearOnlineUsersList = () => {
  const onlineContainer = document.getElementById("online-container");
  onlineContainer.innerHTML = "";
};

const addNewOnlineUser = (user) => {
  const addedUserName = user.username;
  const addedFullName = user.fullname;
  const addedUserID = user.userid;

  const newOnlineUser = addedUserName.slice(0, 2).toUpperCase();

  const onlineContainer = document.getElementById("online-container");
  const newConnectedUser = document.createElement("button");
  newConnectedUser.addEventListener("click", async () => {
    console.log(addedUserID);
    console.log(username, fullname);

    window.location.href = `/private-chat?currentUserName=${username}&currentFullName=${fullname}&selectedUserID=${addedUserID}`;
  });

  newConnectedUser.classList.add(
    "flex",
    "flex-row",
    "items-center",
    "hover:bg-gray-100",
    "rounded-xl",
    "p-2"
  );
  newConnectedUser.innerHTML = `
      <div id="user-name" class="flex items-center justify-center h-8 w-8 bg-orange-200 rounded-full"
      >
        ${newOnlineUser}
      </div>
      <div id="full-name" class="ml-2 text-sm font-semibold">
        ${addedFullName}
      </div>
  `;
  onlineContainer.appendChild(newConnectedUser);
};

const updateOnlineUsersCount = (cnt) => {
  document.getElementById("online-count").innerText = cnt;
};

sendBtn.addEventListener("click", (e) => {
  const message = inputMsg.value;
  //console.log(message);
  socket.emit("chat-message", { sender: fullname, message });
  displaySentMessage({ sender: fullname, message });
  inputMsg.value = "";
});

sendBtn.addEventListener("dblclick", (e) => {
  const message = inputMsg.value;
  console.log(message);
  socket.emit("private-message", { content: message, to: selectedUserID });
  displaySentMessage({ sender: fullname, message });
  inputMsg.value = "";
});

inputMsg.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    document.getElementById("send-btn").click();
  }
});

socket.on("broadcast-message", ({ sender, message }) => {
  displayReceivedMessage({ sender, message });
});

socket.on("updateOnlineUsers", (users) => {
  users = users.filter((user) => user.userid !== socket.id);

  clearOnlineUsersList();

  users.forEach((user) => {
    addNewOnlineUser(user);
  });

  updateOnlineUsersCount(users.length);

  console.log(`${username} is now connected`);
});
