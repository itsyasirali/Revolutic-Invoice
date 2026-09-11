 const chatData = [
  {
    id: 1,
    name: "Alice Smith",
    time: "10:24 AM",
    unread: 2,
    online: true,
    messages: [
      { id: 1, sender: "user", text: "Hi, I placed an order last week but I'd like to get a refund if possible. The item didn't fit.", time: "10:22 AM" },
      { id: 2, sender: "agent", text: "Hello Alice! I'd be happy to help you with that refund. Could you please provide your order number?", time: "10:23 AM" },
      { id: 3, sender: "user", text: "Sure, it's ORDER-12345.", time: "10:24 AM" }
    ]
  },
  {
    id: 2,
    name: "Bob Jones",
    time: "09:41 AM",
    unread: 0,
    online: false,
    messages: [
      { id: 1, sender: "user", text: "Is my payment went through?", time: "09:35 AM" },
      { id: 2, sender: "agent", text: "Hi Bob, yes! Your payment was processed successfully. You'll receive a confirmation email shortly.", time: "09:40 AM" },
      { id: 3, sender: "user", text: "Thanks for the help!", time: "09:41 AM" }
    ]
  },
  {
    id: 3,
    name: "+1 (555) 0192",
    time: "Yesterday",
    unread: 1,
    online: false,
    messages: [
      { id: 1, sender: "user", text: "I ordered 3 days ago.", time: "Yesterday, 3:15 PM" },
      { id: 2, sender: "agent", text: "Hello! Let me check on the status for you. Could you provide your tracking number?", time: "Yesterday, 3:20 PM" },
      { id: 3, sender: "user", text: "Where is my order?", time: "Yesterday, 4:00 PM" }
    ]
  },
  {
    id: 4,
    name: "Sarah Lee",
    time: "Yesterday",
    unread: 0,
    online: true,
    messages: [
      { id: 1, sender: "user", text: "Hey! I realized I put the wrong zip code on my order.", time: "Yesterday, 10:00 AM" },
      { id: 2, sender: "agent", text: "No worries Sarah! Since your order hasn't shipped yet, I can update that for you. What's the correct zip code?", time: "Yesterday, 10:15 AM" },
      { id: 3, sender: "user", text: "I need to change my address.", time: "Yesterday, 10:20 AM" }
    ]
  },
  {
    id: 5,
    name: "Mike Chen",
    time: "Monday",
    unread: 0,
    online: false,
    messages: [
      { id: 1, sender: "user", text: "We're looking to purchase licenses for our whole team.", time: "Monday, 1:00 PM" },
      { id: 2, sender: "agent", text: "That's great! We have an enterprise plan for teams of 10 or more.", time: "Monday, 1:45 PM" },
      { id: 3, sender: "user", text: "Do you offer bulk discounts?", time: "Monday, 2:10 PM" }
    ]
  }
];

export default chatData