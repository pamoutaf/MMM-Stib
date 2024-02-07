# How to SSH into your Raspberry Pi?<br>
If you don't want to keep a keyboard and a mouse connected to your raspberrypi at all times, you can use SSH to connect remotely to your machine.<br>
One thing I like to do is create a start and stop script that I throw on the raspberrypi so I can remotely execute the MagicMirror.<br>
Example:<br>
ssh yourname@raspberrypi.local ./start.sh& <br>
If the '&' doesn't work and you can't run it in the background, you can always run the command without it and wait until the MagicMirror has loaded to exit the SSH session. (CTRL + C)<br>

start.sh<br>
```
	cd MagicMirror && npm start
```
<br>
kill.sh<br>

```
	lsof -i :8080 >> list
	PID=$(awk 'NR==2 {print $2}' list)
	print $PID
	kill $PID
```

# MMM-stib
MagicMirror module to fetch real-time bus/tram schedules.<br>
In the config file:

```
{
			module: "MMM-Stib",
			position: "bottom_bar", //feel free to change the placement.
			config: {
				apiToken: enter your api token here,
				station: [
					{
						direction: "Heysel",
						pointid: "5254"
					},
					{
						direction: "Vanderkindere",
						pointid: "5212"
					},
				],
			}
		}
```
<br>The pointid is the location of the stop where you wish to retrieve the real-time schedule. Be sure to choose the correct line for the pointid otherwise, you might be retrieving another transport's schedule. You can get the pointid information from the following link: https://stibmivb.opendatasoft.com/explore/dataset/gtfs-stops-production/map/?location=15,50.83448,4.3575&basemap=jawg.streets<br>
<br>For your api key, create an account and collect it here: https://stibmivb.opendatasoft.com/account/api-keys/
<br>Feel free to customize the CSS at will. The method to style the cell classes is shown below. This example is the CSS on the class name of the line direction. The rest is similar. You can also view the class and div in the inspect tool if you type npm start dev and use the selector tool on the text cells.
```
.stib-table.small td.direction[class*="vanderkindere"]{
  color: rgb(62, 142, 51);
}
```
<br>Made by P0pcycle (@pamoutaf)
