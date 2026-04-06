# 🎮 Pac-Man Game

A modern, fully-featured Pac-Man game built with HTML5 Canvas, CSS3, and vanilla JavaScript. This implementation includes all the classic Pac-Man mechanics plus modern enhancements.

## 🌟 Features

### Core Gameplay
- **Classic Pac-Man Mechanics** - Navigate through mazes, collect pellets, avoid ghosts
- **Power Pellets** - Eat power pellets to turn the tables on ghosts!
- **4 Ghosts** - Blinky (red), Pinky (pink), Inky (cyan), and Clyde (orange)
- **Level Progression** - Advance through increasingly difficult levels
- **High Score Tracking** - Your best scores are saved locally

### Modern Features
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile devices
- **Touch Controls** - Swipe gestures for mobile play
- **Pause Functionality** - Pause and resume the game anytime
- **Sound Toggle** - Mute/unmute game sounds
- **Smooth Animations** - 60 FPS gameplay with fluid animations

### Audio System
- **Web Audio API** - No external sound files needed
- **Dynamic Sound Effects** - Pellet eating, power pellets, ghost eating, and death sounds
- **Background Music** - Classic Pac-Man siren effect

## 🎯 How to Play

### Desktop Controls
- **Arrow Keys** or **WASD** - Move Pac-Man
- **Space** or **P** - Pause/Resume game
- **Click buttons** for sound toggle and restart

### Mobile Controls
- **Swipe Gestures** - Swipe on the game canvas to move
- **On-screen Buttons** - Use directional buttons for precise control
- **Touch Anywhere** - Start the game and enable sound

## 🏆 Scoring System

| Action | Points |
|--------|--------|
| Regular Pellet | 10 points |
| Power Pellet | 50 points |
| Eating Ghost (in power mode) | 200 points |
| Level Completion | 1000 points |

## 🎮 Game Mechanics

### Power Mode
- Eating a power pellet activates **8 seconds** of power mode
- Ghosts turn blue and become vulnerable
- Scared ghosts move at **50% speed**
- Ghosts flash white when power mode is about to end
- Eating scared ghosts sends them back to the ghost house

### Ghost Behavior
- **Staggered Release**: Ghosts are released gradually
  - Red & Cyan: Start immediately
  - Pink: Released after 3 seconds
  - Orange: Released after 6 seconds
- **Random Movement**: Ghosts choose random directions at intersections
- **Speed Scaling**: Ghosts get 10% faster each level

### Level Progression
- Complete a level by collecting all pellets
- Each level increases ghost speed
- Ghosts maintain their release timing pattern

## 🛠️ Technical Details

### Architecture
- **Object-Oriented Design** - Clean, maintainable code structure
- **Game Loop** - RequestAnimationFrame for smooth 60 FPS gameplay
- **State Management** - Centralized game state handling
- **Collision Detection** - Precise distance-based collision system

### Responsive Design
- **CSS Grid & Flexbox** - Modern layout techniques
- **Media Queries** - Optimized for all screen sizes
- **Touch Events** - Native mobile gesture support
- **Canvas Scaling** - Automatic resolution adjustment

### Performance
- **Optimized Rendering** - Efficient canvas drawing
- **Smart Updates** - Only update what changes
- **Memory Management** - No memory leaks
- **Smooth Animations** - Hardware-accelerated CSS transitions

## 📱 Mobile Optimization

### Touch Controls
- **Swipe Detection** - Natural gesture recognition
- **Button Controls** - Alternative control method
- **Responsive Layout** - Adapts to screen orientation
- **Touch Feedback** - Visual response to touches

### Performance
- **Optimized for Mobile** - Reduced battery drain
- **Smooth Scrolling** - Prevented default browser behaviors
- **Viewport Meta** - Proper mobile rendering

## 🎨 Visual Design

### Styling
- **Modern Aesthetics** - Clean, contemporary look
- **Neon Effects** - Classic arcade feel with CSS glow effects
- **Smooth Transitions** - Fluid UI animations
- **Dark Theme** - Easy on the eyes

### Game Graphics
- **Canvas Rendering** - Smooth, anti-aliased graphics
- **Animated Pac-Man** - Chomping mouth animation
- **Ghost States** - Different appearances for normal/scared modes
- **Visual Feedback** - Clear indication of game states

## 🔧 Installation & Setup

### Local Development
1. **Clone or Download** this repository
2. **Open `index.html`** in your favorite web browser
3. **No Build Process** - Ready to play immediately!

### Web Server (Optional)
For local development with proper HTTP headers:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

## 📁 Project Structure

```
Pac-Man-Game/
├── index.html          # Main HTML file
├── style.css          # Styling and responsive design
├── script.js          # Game logic and engine
└── README.md          # This documentation
```

## 🌐 Browser Compatibility

### Supported Browsers
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 79+
- ✅ Mobile Safari (iOS 11+)
- ✅ Chrome Mobile (Android 7+)

### Required Features
- **HTML5 Canvas** - For game rendering
- **Web Audio API** - For sound effects
- **Touch Events** - For mobile controls
- **LocalStorage** - For high score persistence

## 🎮 Game States

### States
- **Menu** - Initial game state
- **Playing** - Active gameplay
- **Paused** - Game paused (maintains state)
- **Game Over** - End game state
- **Level Complete** - Between levels

### Data Persistence
- **High Scores** - Saved in localStorage
- **Settings** - Sound preferences remembered
- **No Login Required** - Everything stored locally

## 🚀 Performance Tips

### For Best Performance
- **Use Modern Browser** - Latest Chrome/Firefox recommended
- **Close Other Tabs** - Free up system resources
- **Disable Extensions** - Some extensions may interfere
- **Hardware Acceleration** - Enable in browser settings

### Mobile Optimization
- **Portrait Mode** - Best for one-handed play
- **Stable Connection** - For smooth audio playback
- **Sufficient Battery** - Graphics can be intensive

## 🐛 Troubleshooting

### Common Issues
- **Sound Not Working**: Click anywhere on the page to enable audio
- **Controls Not Responsive**: Check if game is paused
- **Mobile Controls**: Ensure you're using touch gestures or buttons
- **Performance**: Close other applications and tabs

### Debug Mode
Open browser developer tools to see:
- Console logs for game events
- Performance metrics
- Network requests (should be none)

## 🤝 Contributing

### How to Contribute
1. **Fork** this repository
2. **Create a feature branch**
3. **Make your changes**
4. **Test thoroughly**
5. **Submit a pull request**

### Development Guidelines
- **Follow existing code style**
- **Test on multiple devices**
- **Document new features**
- **Keep performance in mind**

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Original Pac-Man** - Namco for creating this classic game
- **Web Audio API** - For enabling browser-based sound
- **HTML5 Canvas** - For powerful 2D graphics
- **Modern JavaScript** - For clean, efficient code

## 📞 Support

### Issues & Questions
- **Report Bugs**: Use GitHub Issues
- **Feature Requests**: Submit with detailed description
- **Questions**: Check existing discussions first

### Social
- **Share** your high scores!
- **Tag** us in your gameplay videos
- **Suggest** improvements and new features

---

**Enjoy playing! 🎮✨**

*Built with ❤️ using modern web technologies*
