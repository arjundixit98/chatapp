const sendBtn = document.getElementById("send-btn");
const inputMsg = document.getElementById("message");

const socket = io({ autoConnect: false });
socket.auth = { username: currentUserName, fullname: currentFullName };
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

const displayReceivedMessage = ({ message, sender }) => {
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

sendBtn.addEventListener("click", (e) => {
  const message = inputMsg.value;
  console.log(message);
  socket.emit("private-message", { message, to: selectedUserID });
  displaySentMessage({ sender: currentFullName, message });
  inputMsg.value = "";
});

inputMsg.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    document.getElementById("send-btn").click();
  }
});

socket.on("broadcast-message", ({ message, sender }) => {
  displayReceivedMessage({ message, sender });
});
