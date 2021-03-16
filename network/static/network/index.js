// Component of posts pages (following, all posts)
class AllPosts extends React.Component {
    render() {
        return (
            <div id="all-posts">
                {document.querySelector('#current-user') && <NewPost />}
                <Posts />
            </div>
        )
    }
}
// component of posting new post 
class NewPost extends React.Component {
    render() {
        return (
            <div>
                <div className="card" id="new-post">
                    <div className="card-body form-group">
                        <h2 className="text-light">What's happening?</h2>
                        <textarea className="form-control" id="post-content" style={{ height: '100px' }}></textarea>
                        <button className="btn btn-light" id="post-btn" onClick={this.posted}>Post</button>
                    </div>
                </div>
                <hr></hr>
            </div>
        );
    }
    // insert new post when post button is clicked
    posted = (event) => {
        let content = document.querySelector('#post-content').value;
        fetch('/posts/all', {
            method: 'POST',
            body: JSON.stringify({
                postContent: content,
                action: "posted"
            })
        }).then(response => response.json())
            .then(result => {
                console.log(result);
            });
        window.history.replaceState({}, document.title, "/" + "");
        window.location.href = "";
    }
}
// component of posts displayed 
class Posts extends React.Component {
    constructor() {
        super();
        this.state = {
            postsCount: 0,
            currentPage: 1,
            currentPosts: [],
            profileUser: '',
            following:''
        };
    }
    componentDidMount() {
        let page = window.location.pathname, profileUser = '', action = '';
        if (page.substring(1, 5) == 'page') {
            action = 'getPage';
            page = +page.substring(6);
        }
        else if (page == '/') {
            action = 'getPage';
            page = 1;
        }
        else if (page.substring(1, 8) == 'profile') {
            action = 'getProfile';
            if(page.lastIndexOf('/page/') == -1){
                console.log("first");
                profileUser = page.substring(page.lastIndexOf(('profile/'))+8);
            }
            else{
                console.log("second");
                profileUser = page.substring(page.lastIndexOf('profile/')+8,page.lastIndexOf('/page/'));
            }
            console.log("ok: "+page.lastIndexOf(('profile/')));
            if (page.lastIndexOf('page/')==-1){page=1;}
            else {page = +page.substring(page.lastIndexOf('page/')+5);}
            console.log("action: "+action+" profile: "+profileUser+" page: "+page);
        }
            else if(page.indexOf('/following') != -1){
                action='following';
                if(page == '/following'){page = 1;}
                else{page = +page.substring(page.lastIndexOf('page/')+5);}
            }
        console.log(document.querySelector('#page-1'));
        fetch('/posts/all', { method: 'POST', body: JSON.stringify({ action: action, currentPage: page,profileUsername:profileUser }) }).then(response => response.json())
            .then(posts => {console.log(posts); this.setState({currentPage:page, currentPosts: posts.currentPosts, postsCount: posts.postsCount,profileUser:profileUser==''? '':`/profile/${profileUser}`,following:action =='following'? '/following':''});console.log("page: "+this.state.currentPage); });
    }
    render() {
        return (
            <div>
                {this.state.currentPosts.map((post, index) => (
                    <div key={post.id} className="card post-item">
                        <div className="card-body form-group">
                            <h3><a href={`/profile/${post.owner}`}>{post.owner}</a></h3>
                            <div id="content">
                                <span id={`post-${post.id}`}>{post.content}</span>
                                <textarea className="edit-textarea" id={`edit-${post.id}`}></textarea>
                            </div>
                            <p className="text-muted">{post.timestamp}</p>
                            {document.querySelector('#current-user') && <button id="like-btn" onClick={() => this.like(event, index, post.id, post.like_state)} className="btn btn-danger btn-sm"><span>&#x2764;</span> {post.like_state}</button>}
                            <strong id="likes-num">Likes:{post.likes}</strong>
                            {document.querySelector('#current-user') && post.owner == document.querySelector('#current-user').innerHTML && <button className="btn btn-link" id={`edit-btn-${post.id}`} onClick={()=>{this.edit(event,post.id,post.content)}}>Edit</button>}
                        </div>
                    </div>
                ))}
                <hr></hr>
                <nav id="pagination-bar" className="d-flex justify-content-center align-items-center">
                    <ul className="pagination">
                        {this.state.currentPage != 1 && <li className="page-item page-num"><a className="page-link" href={`${this.state.profileUser}/page/${+this.state.currentPage - 1}`}>Previous</a></li>}
                        {this.setPagination()}
                        {this.state.currentPage * 10 < this.state.postsCount && <li id={`page-${+this.state.currentPage + 1}`} className="page-item page-num"><a href={`${this.state.profileUser}/page/${+this.state.currentPage + 1}`} className="page-link">Next</a></li>}
                    </ul>
                </nav>
            </div>
        )
    }
    // create the pagination of available pages 
    setPagination = () => {
        let listItems = [];
        let postsCnt = this.state.postsCount;
        for (var i = 0; i < postsCnt; i += 10) {
            let pageNum = Math.floor(i / 10 + 1);
            if (this.state.currentPage == pageNum) { var id = "trigger"; }
            else { var id = ""; }
            listItems.push(<li key={i} className="page-item page-num" ><a id={id} href={`${this.state.following}${this.state.profileUser}/page/${pageNum}`} data-start={i} className="page-link">{pageNum}</a></li>);
        }
        return listItems;
    }
    // toggle like button and update db
    like = (event, index, postID, state) => {
        try {
            fetch(`/like/${postID}`, { method: 'POST', body: JSON.stringify({ "state": state }) }).then(response => response.json()).then(result => { console.log(result); });
            this.setState(prevState => {
                console.log("index: " + index);
                console.log("id: " + postID);
                const newItems = [...prevState.currentPosts];
                if (state === 'Unlike') {
                    newItems[index].likes -= 1;
                    newItems[index].like_state = 'Like';
                }
                else {
                    newItems[index].likes += 1;
                    newItems[index].like_state = 'Unlike';
                }
                return { currentPosts: newItems };
            })
        } catch (error) { console.log(error) }
    }
    // edit post, toggle button and update db
    edit = (event,id,content)=>{
        let editBtn = document.querySelector(`#edit-btn-${id}`);
        let editTextarea = document.querySelector(`#edit-${id}`);
        let postContent = document.querySelector(`#post-${id}`);
        if(editBtn.innerHTML == 'Edit'){
        postContent.style.display = 'none';
        editTextarea.style.display = 'block';
        editTextarea.value = content;
        editBtn.innerHTML = 'Save';
    }
    else{
        let newContent = editTextarea.value;
        fetch(`edit/${id}`,{
            method:'PUT',
            body:JSON.stringify({"content":newContent})
        }).then(response=>response.json()).then(result=>{console.log(result);});
        postContent.innerHTML = newContent;
        postContent.style.display = 'block';
        editTextarea.style.display = 'none';
        editBtn.innerHTML = 'Edit';
    }
    }
}
// component of profile page
class Profile extends React.Component {
    render() {
        return (
            <div id="profile-page">
                <ProfileHeader />
                <Posts />
            </div>
        );
    }
}
// component of info about this user
class ProfileHeader extends React.Component {
    constructor() {
        let user = window.location.pathname
        if(user.indexOf('/page') == -1){user = user.substring(9);console.log("firstt")}
        else{user = user.substring(9,user.indexOf('/page'));}
        super();
        this.state = {
            profileUser:user,
            followers:0,
            following:0,
            follow_state:''
        }
    }
    componentDidMount(){
        fetch(`/follow/${this.state.profileUser}`).then(response=>response.json()).then(result=>{console.log(result);this.setState({followers:result.followers,following:result.following,follow_state:result.follow_state});});
    }
    render() {
        return (
            <div>
                <div className="card" id="profile-header">
                    <div className="card-body">
                        <div className="row">
                        <strong className="col-6" id="profile-name">{this.state.profileUser}</strong>
                        {document.querySelector('#current-user') && this.state.profileUser != document.querySelector('#current-user').innerHTML && <button id="follow-btn" onClick={() => this.follow(event ,this.state.follow_state)} className="btn btn-primary btn-sm">{this.state.follow_state}</button>}
                        </div>
                        <div className="row">
                        <span className="col-6"><strong>Followers:</strong>&nbsp;{this.state.followers}</span>
                        <span id="following"><strong>Following:</strong>&nbsp;{this.state.following}</span>
                        </div>
                    </div>
                </div>
                <hr></hr>
            </div>
        );
    }
    follow = (event,state) => { 
        fetch(`/follow/${this.state.profileUser}`,{method:'POST',body:JSON.stringify({"state":state})});
            if(state == 'Unfollow'){this.setState({follow_state:'Follow',followers:this.state.followers-1});}
            else{this.setState({follow_state:'Unfollow',followers:this.state.followers+1})}
    }
}
if (window.location.href.indexOf('/profile') != -1) {
    ReactDOM.render(<Profile />, document.querySelector('#index'));
}
else if (document.querySelector('#index')) {
    ReactDOM.render(<AllPosts />, document.querySelector('#index'));
}
