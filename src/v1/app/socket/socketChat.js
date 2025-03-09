const socketIo = require('socket.io');
const { newMessage, normalChatList, userInChatScreen, findReccieverSocket, findReceiverSocket, updateLastSeen } = require('./chatSocketss/chatController');

const userSocketMap = {}
const getRecipientSocketId = (recipientId) => userSocketMap[recipientId];


const setupSocket = (server) => {
    const io = socketIo(server)
    io.on('connection', async (socket) => {
        const { userId } = socket.handshake.query

        if (userId !== 'undefined') userSocketMap[userId] = socket.id;
        // const receiverSockets = getRecipientSocketId(userId);
        const lastSeen = await updateLastSeen(userId, true)
        const findReccieverSockets = await findReceiverSocket(userId); // Find other users in the chat

        findReccieverSockets.forEach(({ chatId, otherUser }) => {

            otherUser.toString();
            const receiverSocketId = getRecipientSocketId(otherUser); // Get the receiver's socket ID

            if (receiverSocketId) {
                socket.to(receiverSocketId).emit('userOnline', {
                    isOnline: true,
                    lastSeen,
                    chatId,
                });
            }
        });
        socket.on('requestChatList', async () => {
            try {


                // Get the recipient socket ID
                const senderSockets = getRecipientSocketId(userId);

                if (!senderSockets) {

                    return;
                }

                // Fetch the chat list from DB
                const chatData = await normalChatList(userId);


                // Emit the chat list back to the client
                io.to(senderSockets).emit('chatList', chatData);
            } catch (error) {
                console.error("❌ Error fetching chat list:", error);
            }
        });

        socket.on('iamOnline', async () => {
            const lastSeen = await updateLastSeen(userId, true)
            const findReccieverSockets = await findReceiverSocket(userId); // Find other users in the chat

            findReccieverSockets.forEach(({ chatId, otherUser }) => {

                otherUser.toString();
                const receiverSocketId = getRecipientSocketId(otherUser); // Get the receiver's socket ID

                if (receiverSocketId) {
                    socket.to(receiverSocketId).emit('userOnline', {
                        isOnline: true,
                        lastSeen,
                        chatId,
                    });
                }
            });
        })

        socket.on('sendMessage', async (data) => {


            data.senderId = userId


            const messageDetails = await newMessage(data);
            const chatData = await normalChatList(data.receiverId);

            const chatIds = data.chatId

            const chatId = messageDetails.data.chatId;
            const chatscreenstatus = await userInChatScreen(userId, chatIds, true)

            const emit = 'newMessage';
            const dataToSend = messageDetails.data;

            if (messageDetails.status) {
                // await updateTypingStatus(chatId, receiverId, false);

                const receiverSockets = getRecipientSocketId(data.receiverId);

                if (receiverSockets) {

                    socket.to(receiverSockets).emit(emit, dataToSend);
                    socket.to(receiverSockets).emit('chatList', chatData);
                    socket.to(receiverSockets).emit('chatscreen', chatscreenstatus);
                    // socket
                    //     .to(receiverSockets)
                    //     .emit('userTyping', { chatId: chatId, isTyping: false });
                }
            } else {
                const senderSocket = getRecipientSocketId(userId);
                io.to(senderSocket).emit('Error', messageDetails);
            }

            const senderSockets = getRecipientSocketId(userId);

            if (senderSockets) {
                socket.to(senderSockets).emit(emit, dataToSend);
            }
        });

        socket.on("InchatScreen", async (data) => {
            const { receiverId, chatId, status } = data;

            const recciverSockets = getRecipientSocketId(receiverId);
            const chatscreenstatus = await userInChatScreen(userId, chatId, status)



            if (recciverSockets) {
                const chatData = await normalChatList(receiverId);

                socket.to(recciverSockets).emit('chatscreen', chatscreenstatus);
                socket.to(recciverSockets).emit('chatList', chatData);
            } else {
                console.error(`No socket found for userId: ${receiverId}`); // Log if no socket found
            }
        })

        socket.on('online', async (data) => {
            const status = data.status;
            const lastSeen = await updateLastSeen(userId, status)
        })



        socket.on('disconnect', async () => {
            if (userId !== undefined && userId !== null && userId !== 'NaN' && userId !== 'null') {

                const receiverSockets = getRecipientSocketId(userId);
                const lastSeen = await updateLastSeen(userId, false)
                const findReccieverSockets = await findReceiverSocket(userId); // Find other users in the chat

                findReccieverSockets.forEach(({ chatId, otherUser }) => {

                    otherUser.toString();
                    const receiverSocketId = getRecipientSocketId(otherUser); // Get the receiver's socket ID

                    if (receiverSocketId) {
                        socket.to(receiverSocketId).emit('userOnline', {
                            isOnline: false,
                            lastSeen,
                            chatId,
                        });
                    }
                });
                delete userSocketMap[userId];
            }
        });
    })
    return io;
}
module.exports = {
    setupSocket, getRecipientSocketId
}