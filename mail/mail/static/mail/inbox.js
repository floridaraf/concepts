  document.addEventListener('DOMContentLoaded', function() {
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  // If submitted, send email
  document.querySelector('#compose-submit').addEventListener('click', (event) => {
    event.preventDefault();
    send_mail();
  });
  // By default, load the inbox
  load_mailbox('inbox');
});


function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}


function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  if (mailbox == "show_email") {
    show_email();
  }

  // Load mailbox
  fetch(`/emails/${mailbox}`)
  .then((response) => response.json())
  .then((emails) => {
    emails.forEach((element) => {
      if (mailbox != "sent") {
        sender_recipients = element.sender;
      } else {
        sender_recipients = element.recipients;
      }
      if (mailbox == "inbox") {

        if (element.read) 

          is_read = "read";

        else is_read = "";
      } 
      
      else is_read = "";

      //create div to contain all sub-elements

      let item = document.createElement("div");
      item.style = `max-height: 80px;`
      
      
      /// create div for email sender info

      var recipDiv = document.createElement('div');
      recipDiv.className = 'col-sm-3';
      recipDiv.innerHTML = sender_recipients;
      
      // subject div

      var subDiv = document.createElement('div');
      subDiv.className = 'col-sm-3';

      if (element.subject.length > 18)
        subDiv.innerHTML = `${element.subject.slice(0,18)}...`;
      else subDiv.innerHTML = `${element.subject}`;

      if (!is_read){
        subDiv.style = 'padding-left:auto; padding-right: auto; color: black; font-weight: 300; position: relative;';}
      else subDiv.style = 'min-width:50px; font-weight: 400; position: relative;';

      //create body preview
      
      var peek = document.createElement('div');

      /// if email is a reply, return last message preview only

      var bodyPeek = element.body;
      var replacing2 = bodyPeek.split("___________________________________________");
      var peek1 = replacing2.slice(-1,);
      var peek2 = peek1.join();

      if (subDiv.innerHTML.slice(0, 3) == "Re:") {
        

        peek.innerHTML =  `...${peek2.slice(-20,)}`;}

      else{ 
        
        if (bodyPeek.length > 18)
          peek.innerHTML = `${bodyPeek.slice(0,18)}...`;

        else peek.innerHTML = `${bodyPeek}`;
      }
      ///

      peek.className = ' col-sm-3'; 
      peek.style = "mh-100 color: grey; font-size: smaller;";
      

      // timestamp div

      var datetime = document.createElement('div');
      datetime.className = 'small col-sm-3 text-right';
      datetime.innerHTML = `${element.timestamp}`;
      
      

      item.innerHTML = `<div id="item-${element.id}">
    </div>`;
      
      //combine divs into parent row div
      item.appendChild(recipDiv);
      item.appendChild(subDiv);
      item.appendChild(peek);
      item.appendChild(datetime);

      if (is_read == "read") {
        item.className = `mailrow row bg-light text-muted border border-white`;
        
      }
      else item.className = `mailrow row rounded-lg bg-white text-dark border-bottom border-light text-secondary`;
      
      document.querySelector("#emails-view").appendChild(item);
      item.addEventListener("click", () => {
        show_email(element.id, mailbox);
      });
    });
  });
}


function send_mail() {

// prevent empty recipient
if (!document.querySelector('#compose-recipients').value) 
  
  return alert(`Please add at least 1 recipient.`);

  // POST
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value,
    })

  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log('Success: ', result);
      load_mailbox('sent');
  })
  .catch((error) => {
    console.error('Error:', error);
  });
}


function show_email(id, mailbox) {
  fetch(`/emails/${id}`)
    .then((response) => response.json())
    .then((email) => {
      // Print email
      // console.log(email);
      document.querySelector("#emails-view").innerHTML = "";
      var item = document.createElement("div");
      item.className = `card`;
      item.innerHTML = `<div class="card-body" style="white-space: pre-wrap;">
  Sender: ${email.sender}
  Recipients: ${email.recipients}
  Subject: ${email.subject}
  Time: ${email.timestamp}
  <br>${email.body}
      </div>`;
      document.querySelector("#emails-view").appendChild(item);
      if (mailbox == "sent") return;
      let archive = document.createElement("btn");
      archive.className = `btn btn-outline-info my-2`;
      archive.addEventListener("click", () => {
        switch_archive(id, email.archived);
        if (archive.innerText == "Archive") archive.innerText = "Unarchive";
        else archive.innerText = "Archive";
      });
      if (!email.archived) archive.textContent = "Archive";
      else archive.textContent = "Unarchive";
      document.querySelector("#emails-view").appendChild(archive);

      let replybutton = document.createElement("btn");
      replybutton.className = `btn btn-outline-success m-2`;
      replybutton.textContent = "Reply";
      replybutton.addEventListener("click", () => {

        reply(email.sender, email.subject, email.body, email.timestamp);
      });
      document.querySelector("#emails-view").appendChild(replybutton);
      read(email.id);
    });
}



function read(email_id) {
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    credentials: "same-origin",
    headers: {
      "X-CSRFToken": getCookie("csrftoken"),
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      read: true
    })
  })
}


function switch_archive(id, state) {
  fetch(`/emails/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      archived: !state,
    }),
  });
}


function reply(sender, subject, body, timestamp) {
  compose_email();
  if (!/^Re:/.test(subject)) subject = `Re: ${subject}`;
  document.querySelector("#compose-recipients").value = sender;
  document.querySelector("#compose-subject").value = subject;

  pre_fill = `On ${timestamp} ${sender} wrote:\n\n${body}\n\n___________________________________________\n\n`;

  document.querySelector("#compose-body").value = pre_fill;
}


