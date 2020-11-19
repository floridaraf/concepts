document.addEventListener('DOMContentLoaded', function() {
    // By default, load all
    load_all();
    $('p[class="pt"][id=15]').on('click', function() {
        alert('clicked');
        this.innerHTML = 'edited';
    });
    // Edit click
    const edits = document.querySelectorAll(".edit")
    edits.forEach(
        function(e) {
            e.addEventListener('click', (event) => {
                event.preventDefault();
                console.log('Edit was clicked');
                load_edit(event.target.id);
            });
        }
    );


    const msgbtn = document.querySelectorAll(".message")
    msgbtn.forEach(
        function(e) {
            e.addEventListener('click', (event) => {
                event.preventDefault();
                console.log('msgbtn was clicked');
                
                load_message(event.target.id, event.target.name);
            });
        }
    );



    
    const blab_button = document.querySelector('#blab_')
    blab_button.onclick = function() {load_newpost();}

    var close_button = document.querySelector('#close_post')
    close_button.onclick = function() {close_newpost();}
    
    var close_msg= document.querySelector('#close_message')
    close_msg.onclick = function() {close_message();}

    //close offer click

    const closers = document.querySelectorAll(".close")
    closers.forEach(
        function(cl) {
            
            cl.addEventListener('click', (event) => {
                event.preventDefault();
                close_offer(event.target.id);
                console.log('Close offer was clicked');
                window.location.reload();
            } );
        }

    );

    
    // Comment click
    const comments = document.querySelectorAll(".comment")
    comments.forEach(
        function(ct) {
            ct.addEventListener('click', (event) => {
                event.preventDefault();
                console.log('Comment was clicked');
                load_comment(event.target.id);
            });
        }
    );
    // Like click
    const likes = document.querySelectorAll("i[name='heart']")
    likes.forEach(
        function(lk) {
            lk.addEventListener('click', (event) => {
                event.preventDefault();
                console.log('Like was clicked');
                update_likes(event.target.id);
            });
        }
    );
});

function load_all() {
    // Display all posts only
    document.querySelector('#compose-view-home').style.display = 'none';
    document.querySelector('#posts').style.display = 'block';
    document.querySelector('#comment').style.display = 'none';
    document.querySelector('#edit').style.display = 'none';
    document.querySelector('#new_post').style.display = 'none';
    document.querySelector('#all_posts_block').style = 'font:black; font-weight: bold; background-image: linear-gradient(to left, teal, grey);'
    document.querySelector('#all_posts_link').style = 'text-fill-color: transparent;'


    
    
}



function load_newpost() {

    //display new_post editor above all
    const posts_display = document.querySelector('#posts');
    const compose = document.querySelector('#new_post');

   
    posts_display.style.opacity = '40%'
   
    document.querySelector('#comment').style.display = 'none';
    document.querySelector('#edit').style.display = 'none';
    document.querySelector('#new_post').style = 'position: fixed; z-index: 2; top: 0; right:0; left:0; background-color: white; overflow-x: hidden;';
    document.querySelector('#all_posts_block').style = 'background-image: linear-gradient(to left, orange, white);'
    document.querySelector('#all_posts_link').style = 'text-fill-color: transparent;'



}

function close_newpost() {

    const posts_display = document.querySelector('#posts');
    const compose = document.querySelector('#new_post');

    posts_display.style.opacity = '100%';
    compose.style.display = 'none';


}

function close_message() {

    document.querySelector('#compose-view-home').style.display = 'none';
    document.querySelector('#posts').style.opacity = '100%';

}

function close_offer(post_id) {

    fetch(`close/${post_id}`, {
        method: 'PUT',
        credentials: "same-origin",
        headers: {
            "X-CSRFToken": getCookie("csrftoken"),
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            
        }),
    })


}



function load_edit(post_id) {
    // Display edit only
    document.querySelector('#new_post').style.display = 'none';
    document.querySelector('#posts').style.display = 'none';
    document.querySelector('#comment').style.display = 'none';
    document.querySelector('#edit').style.display = 'block';

    console.log('Edit div is being loaded');
    fetch(`/${post_id}`, {
        method: 'GET',
        credentials: "same-origin",
        headers: {
            "X-CSRFToken": getCookie("csrftoken"),
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
    })
    .then(response => response.json())
    .then(post => {
        // Print post
        console.log(post);
        // Prefill
        var t = document.getElementById("edit");
        t.querySelector("#id_text").value = `${post.text}`;
    });

    // Edit submit click
    document.querySelector("#edit-submit").addEventListener('click', (event) => {
        event.preventDefault();
        console.log('Edit submit was clicked');
        send_edit(post_id);
    });
}

function send_edit(post_id) {
    var t = document.getElementById("edit");
    var ft = t.querySelector("#id_text").value;
    console.log(`Edited text: ${ft}`);
    // PUT
    fetch(`/${post_id}`, {
        method: 'PUT',
        credentials: "same-origin",
        headers: {
            "X-CSRFToken": getCookie("csrftoken"),
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            text: ft,
        }),
    })
    .then(response => response.json())
    console.log('Edit submitted');
    $('p[class="pt"]'+'[id=' + CSS.escape(post_id) + ']').html(ft);
    load_all();
}

function load_comment(post_id) {
    // Display comment only
    document.querySelector('#new_post').style.display = 'none';
    document.querySelector('#posts').style.display = 'none';
    document.querySelector('#comment').style.display = 'block';
    document.querySelector('#edit').style.display = 'none';
    document.querySelector('#pages').style.display = 'none';
    

    console.log('Comment div is being loaded');
    // Comment submit click
    document.querySelector("#comment-submit").addEventListener('click', (event) => {
        event.preventDefault();
        console.log('Comment submit was clicked');
        send_comment(post_id);
    });
}

function send_comment(post_id) {
    var c = document.querySelector("#id_comment").value;
    console.log(`New comment: ${c}`);
    // PUT
    fetch(`/${post_id}`, {
        method: 'PUT',
        credentials: "same-origin",
        headers: {
            "X-CSRFToken": getCookie("csrftoken"),
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            comment: c,
        })
    })
    .then(response => response.json());
    console.log('Comment submitted');
    load_all();
}

function update_likes(post_id) {
    // Select current like info
    var n = $('span[class="num-like"]'+'[id=' + CSS.escape(post_id) + ']').html();
    var h = $('i[name="heart"]' + '[id=' + CSS.escape(post_id) + ']').css('color');

    console.log(`Selected id: ${post_id}, #: ${n}, color: ${h}`);

    // +1
    if (h === 'rgb(128, 128, 128)') {
        n++;
        $('span[class="num-like"]' + '[id=' + CSS.escape(post_id) + ']').html(n);
        $('i[name="heart"]' + '[id=' + CSS.escape(post_id) + ']').css('color', 'red');
    }
    // -1
    if (h === 'rgb(255, 0, 0)') {
        n--;
        $('span[class="num-like"]' + '[id=' + CSS.escape(post_id) + ']').html(n);
        $('i[name="heart"]' + '[id=' + CSS.escape(post_id) + ']').css('color', 'gray');
    }

    // PUT
    fetch(`/${post_id}`, {
        method: 'PUT',
        credentials: "same-origin",
        headers: {
            "X-CSRFToken": getCookie("csrftoken"),
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            likes: n,
        }),
    })
    .then(response => response.json())
    console.log(`# likes updated to ${n}`);
    load_all();
}


function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


function load_message(name, title){
    
    document.querySelector('#posts').style= 'opacity:80%; z-index:0;';
    document.querySelector('#compose-view-home').style = 'border-radius:2%; position: fixed; z-index: 2; top: 160px; overflow-x: hidden;';
    document.querySelector('#compose-name').value = name;
    document.querySelector('#compose-subject').value = title;
    document.querySelector('#compose-submit').addEventListener('click', (event) => {
        event.preventDefault();
        send_mail();
        load_all();
        
      });


}

  document.addEventListener('DOMContentLoaded', function() {
    // Use buttons to toggle between views
    document.querySelector('#load').addEventListener('click', () => load_mailbox('inbox'));
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
          sender_recipients = element.name;
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
        item.style = `max-height: 80px; max-width: 1000px; position:relative; padding: 5px;`
        
        
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
          item.className = `row bg-light text-muted border-bottom border-white`;
          
        }
        else item.className = `row bg-white shadow text-dark border-top border-white text-secondary`;
  
        document.querySelector("#emails-view").appendChild(item);
        item.addEventListener("click", () => {
          show_email(element.id, mailbox);
        });
      });
    });
  }
  
  
  function send_mail() {
  
  // prevent empty recipient
  if (!document.querySelector('#compose-name').value) 
    
    return alert(`Please add at least 1 recipient.`);
  
    // POST
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: document.querySelector('#compose-name').value,
          subject: document.querySelector('#compose-subject').value,
          body: document.querySelector('#compose-body').value,
      })
  
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log('Success: ', result);
          window.confirm("sent!");
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
        archive.id = 'archive_btn';
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
        replybutton.id = 'reply_btn';
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
    document.querySelector("#compose-name").value = sender;
    document.querySelector("#compose-subject").value = subject;
  
    pre_fill = `On ${timestamp} ${sender} wrote:\n\n${body}\n\n___________________________________________\n\n`;
  
    document.querySelector("#compose-body").value = pre_fill;
  }
  
  
  