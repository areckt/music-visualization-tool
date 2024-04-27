const Profile = ({ profile }) => {
  const { display_name, id, email, uri, href } = profile
  return (
    <section id="profile">
      <h2>Logged in as {display_name}</h2>
      <ul>
        <li>User ID: {id}</li>
        <li>Email: {email}</li>
        <li>Spotify URI: {uri}</li>
        <li>Link: {href}</li>
      </ul>
    </section>
  )
}
export default Profile
