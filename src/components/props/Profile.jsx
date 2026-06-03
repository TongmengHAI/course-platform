import React from 'react';

// The Avatar component stays clean and reusable
function Avatar({ person, position }) {
  return (
    <div>
        <img
        className="avatar"
        src={person.avatarUrl}
        alt={person.name}
        width={100}
        height={100}
        style={{ borderRadius: '50%', margin: '10px' }} // Optional styling touch
        />
        <p>{position}</p>
    </div>
  );
}

export default function ProfileList ({ p1, p2 }) {

  return (
    <div className="profile-list" style={{ display: 'flex' }}>
        <Avatar  person={p1} position={p2} />  
    
    </div>
  );
}