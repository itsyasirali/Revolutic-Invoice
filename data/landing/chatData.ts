const chatData = [
  {
    id: 1,
    name: "Alice Smith",
    time: "10:24 AM",
    unread: 2,
    online: true,
    messages: [
      { id: 1, sender: "user", text: "Hi, could you send me the invoice for last week's design work?", time: "10:22 AM" },
      { id: 2, sender: "agent", text: "Hello Alice! Invoice INV-1042 for $1,250.00 has just been sent to your email.", time: "10:23 AM" },
      { id: 3, sender: "user", text: "Got it, thank you!", time: "10:24 AM" }
    ]
  },
  {
    id: 2,
    name: "Bob Jones",
    time: "09:41 AM",
    unread: 0,
    online: false,
    messages: [
      { id: 1, sender: "user", text: "Did my payment go through?", time: "09:35 AM" },
      { id: 2, sender: "agent", text: "Hi Bob, yes! Payment of $840.00 for INV-1038 was received and the invoice is marked as paid.", time: "09:40 AM" },
      { id: 3, sender: "user", text: "Thanks for the help!", time: "09:41 AM" }
    ]
  },
  {
    id: 3,
    name: "Northwind Traders",
    time: "Yesterday",
    unread: 1,
    online: false,
    messages: [
      { id: 1, sender: "agent", text: "Friendly reminder: invoice INV-1031 for $3,400.00 is due in 3 days.", time: "Yesterday, 3:15 PM" },
      { id: 2, sender: "user", text: "Thanks, we'll pay it by Friday.", time: "Yesterday, 4:00 PM" }
    ]
  },
  {
    id: 4,
    name: "Sarah Lee",
    time: "Yesterday",
    unread: 0,
    online: true,
    messages: [
      { id: 1, sender: "user", text: "The tax ID on my invoice is wrong.", time: "Yesterday, 10:00 AM" },
      { id: 2, sender: "agent", text: "No worries Sarah! I've updated your customer profile and re-sent a corrected invoice.", time: "Yesterday, 10:15 AM" },
      { id: 3, sender: "user", text: "Perfect, that looks right now.", time: "Yesterday, 10:20 AM" }
    ]
  },
  {
    id: 5,
    name: "Mike Chen",
    time: "Monday",
    unread: 0,
    online: false,
    messages: [
      { id: 1, sender: "user", text: "Can you invoice us monthly for the retainer?", time: "Monday, 1:00 PM" },
      { id: 2, sender: "agent", text: "Absolutely! I've set up a recurring monthly invoice of $2,000.00 starting next month.", time: "Monday, 1:45 PM" },
      { id: 3, sender: "user", text: "Great, that saves us time.", time: "Monday, 2:10 PM" }
    ]
  }
];

export default chatData
