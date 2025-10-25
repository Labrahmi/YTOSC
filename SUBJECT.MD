# Chrome Extension Technical Assessment: YouTube Outlier Score Calculator

The candidate will create a Chrome extension that analyzes videos on a YouTube channel page and displays the "outlier score" for each video.

## Required Technologies
- **Framework:** React
- **Language:** TypeScript
- **Bundler:** Vite
- **Exclusions:** Next.js or any other similar framework are prohibited.

## Extension Functionality
The extension must, when navigating to a YouTube channel page, display the outlier scores for the videos.

You are strongly encouraged to test the reference Chrome extension to understand the expected visual presentation and functionality. This will provide a clear benchmark for the outlier score display and overall user experience.

**Reference Extension URL:**
https://chromewebstore.google.com/detail/1of10com-optimization-too/gkfdnmclhbgbidnpmimfdobgjpeblckn

## Outlier Score Display
The outlier score must be displayed at the beginning of each video's title, following a specific visual style (see the "Visual Presentation" section below).

## Outlier Score Formula
The `video_outlier_score` is calculated as follows:

```
video_outlier_score = video_views / median views of the list composed of the 5 videos posted after and the 5 posted before the specific video
```

The list of videos for the median calculation must contain 10 videos in total without containing the video we're doing the computation for.

## Edge Case Management
The candidate must pay particular attention to the following edge cases:

- **Insufficient number of videos:** If a video is close to the beginning or end of the videos published on the channel and there are not 5 videos before or after, the total of 10 videos must be maintained by taking more videos from the other side. For example, if the second to last published video is analyzed, there will only be one video published after; the candidate will therefore need to take 9 videos published before to complete the list of 10. If fewer than 10 videos are available in total on the channel, the calculation should be performed with the number of available videos.

- **View formats:** Handle different representations of views (e.g., "1.2k", "12M", "500K", "1B") and their equivalents in different languages.

- **YouTube display languages:** The extension must function correctly, regardless of YouTube's display language.

- **Videos without views:** Handle videos with 0 views, member-only videos, or scheduled videos (where the number of views is not yet defined).

## Outlier Filters
The extension must include filters to display only videos whose outlier score is greater than:

- 2x the median
- 5x the median
- 10x the median

These filtered video lists must be sorted by outlier score in descending order (highest score at the top of the list) + A reset button

## Visual Presentation
The outlier scores must be displayed with the same appearance as on the reference application. This includes exact border-radius and identical color grading. The candidate may reasonably reverse engineer the reference app to find the color codes and values needed.