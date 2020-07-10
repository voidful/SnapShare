import React from 'react';
import './controller.css';

class Controller extends React.Component {


    constructor(props) {
        super(props);
        const {joinRoom, sendMessage} = this.props
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        joinRoom(token)
        console.log(token);

        this.state = {value: '', token: token};
        this.sendMessage = sendMessage
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }

    handleSubmit(event) {
        event.preventDefault();
        this.sendMessage({'link': this.state.value}, this.state.token);
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <div className="form__group field">
                    <input type="input" className="form__field" placeholder="Name" name="Link" id='name'
                           value={this.state.value} onChange={this.handleChange} required/>
                    <label htmlFor="name" className="form__label">Link</label>
                </div>
                <br/>
                <br/>
                <button className="btn" type="submit">
                    Submit
                </button>
            </form>
        );
    }
}

export default Controller;
