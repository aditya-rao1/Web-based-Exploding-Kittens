import magnifying_glass from '../assets/magnifying-glass-svgrepo-com.svg'
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
import { useNavigate } from 'react-router-dom'


export default function Home() {

    const navigate = useNavigate();

    const handleJoinRoom = () => {
        navigate('/starter');
    }

    return (
        <div>
        {/* Main content */}
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Select a Game</h1>
        <div className="game-cards grid grid-cols-3 gap-4">
          {/* Your game cards go here */}
          <Card sx={{ maxWidth: 500 }}>
            <CardActionArea onClick={handleJoinRoom}>
              <CardMedia
                component="img"
                height="140"
                image={magnifying_glass}
              />
              <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                Exploding Kittens
              </Typography>
            </CardContent>
            </CardActionArea>
          </Card>
        </div>
      </div>
        </div>
    );
}